from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, get_jwt_identity, jwt_required
from api.models import db, Usuarios, Tienda, Producto, Inventario, UsuarioTienda, Ticket, TokenBlocklist, Cliente, Proveedor, ProveedorTienda
from api.utils import contraseñaAleatoria
from api.decoradores import vendedor_required, ceo_required, admin_required
from datetime import timedelta, datetime
from sqlalchemy import func
import openfoodfacts

api = Blueprint('api', __name__)
lector = openfoodfacts.API(user_agent="TiendaCRM/1.0")

# ==============================
# RUTAS DE SEGURIDAD
# ==============================

# Ruta para iniciar sesión
@api.route('/login', methods=['POST'])
def login():
    try:
        request_body = request.get_json()
        print("Request body:", request_body)  # Log para debugging
        
        if not request_body:
            return jsonify({"error": "Datos incompletos"}), 400

        email = request_body.get("email")
        contraseña = request_body.get("contraseña")

        if not email or not contraseña:
            return jsonify({"error": "Email y contraseña son requeridos"}), 400

        usuario = Usuarios.query.filter_by(email=email).first()
        print("Usuario encontrado:", usuario)  # Log para debugging
        rol = UsuarioTienda.query.filter_by(usuario_email=email).first().rol
        print("Rol:", rol)  # Log para debugging
        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 401
            
        if not usuario.check_password(contraseña):
            return jsonify({"error": "Contraseña incorrecta"}), 401

        # Generar tokens
        access_token = create_access_token(
            identity=usuario.email,
            expires_delta=timedelta(minutes=15),
            additional_claims={"rol": rol}
        )
        
        refresh_token = create_refresh_token(
            identity=usuario.email,
            expires_delta=timedelta(days=30)
        )

        response_data = {
            "status": True,
            "data": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "datos": usuario.serialize()
            }
        }
        print("Response data:", response_data)  # Log para debugging
        return jsonify(response_data), 200
        
    except Exception as e:
        print("Error en login:", str(e))  # Log para debugging
        return jsonify({"status": False, "error": str(e)}), 500

# Ruta para refrescar el token de acceso
@api.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)  # Solo accesible con un token de refresco válido
def refresh_token():
    try:
        current_user = get_jwt_identity()  # Obtiene el email del usuario
        new_access_token = create_access_token(identity=current_user, expires_delta=timedelta(minutes=15))
        return jsonify(access_token=new_access_token), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para cerrar sesión
@api.route('/logout', methods=['DELETE'])
@jwt_required()
def logout():
    try:
        jti = get_jwt()["jti"]  # Obtener el ID único del token actual
        revoked_token = TokenBlocklist(jti=jti)
        db.session.add(revoked_token)
        db.session.commit()
        return jsonify({"message": "Sesión cerrada exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ==============================
# RUTAS DE USUARIOS
# ==============================

@api.route('/usuario/registroInicial', methods=['POST'])
def registro_inicial():
    try:
        request_body = request.get_json()

        nueva_tienda = Tienda(
            nombre=request_body["tienda"]["nombre"],
            direccion=request_body["tienda"]["direccion"],
            hora_apertura=request_body["tienda"]["hora_apertura"],
            hora_cierre=request_body["tienda"]["hora_cierre"]
        )
        db.session.add(nueva_tienda)
        db.session.flush()

        nuevo_ceo = Usuarios(
            email=request_body["usuario"]["email"],
            nombre=request_body["usuario"]["nombre"],
            apellido=request_body["usuario"]["apellido"],
            fecha_contratacion=request_body["usuario"]["fecha_contratacion"],
            hora_entrada=request_body["usuario"]["hora_entrada"],
            hora_salida=request_body["usuario"]["hora_salida"],
            is_active=True
        )
        nuevo_ceo.set_password(request_body["usuario"]["contraseña"])
        db.session.add(nuevo_ceo)
        db.session.flush()

        rel_ceo_tienda = UsuarioTienda(
            usuario_email=nuevo_ceo.email,
            tienda_id=nueva_tienda.id,
            rol='ceo'
        )
        db.session.add(rel_ceo_tienda)
        db.session.commit()

        access_token = create_access_token(
            identity=nuevo_ceo.email,
            expires_delta=timedelta(minutes=15),
            additional_claims={"rol": rel_ceo_tienda.rol}
        )
        
        refresh_token = create_refresh_token(
            identity=nuevo_ceo.email,
            expires_delta=timedelta(days=30)
        )
        
        return jsonify({
            "message": "Registro exitoso",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "tienda": nueva_tienda.serialize(),
            "usuario": nuevo_ceo.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Agregar nuevo usuario (admin o vendedor)
@api.route('/usuario/nuevo', methods=['POST'])
@admin_required
def nuevoAdmin():
    try:
        request_body = request.get_json()
        if not request_body:
            return jsonify({"error": "Datos incompletos"}), 400

        usuario = Usuarios(
            nombre=request_body["nombre"],
            apellido=request_body["apellido"],
            email=request_body["email"],
            is_active=True,
            fecha_contratacion=request_body["fecha_contratacion"],
            hora_entrada=request_body["hora_entrada"],
            hora_salida=request_body["hora_salida"]
        )
        contraseñaTemporal = contraseñaAleatoria()
        usuario.set_password(contraseñaTemporal)
        db.session.add(usuario)
        db.session.flush()

        relacion = UsuarioTienda(
            usuario_email=usuario.email,
            tienda_id=request_body["tienda_id"],
            rol=request_body["rol"]
        )
        db.session.add(relacion)
        db.session.commit()

        return jsonify({
            "usuario": usuario.serialize(),
            "contraseñaTemporal": contraseñaTemporal
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Obtener colaboradores de una tienda
@api.route('/usuario/tienda/<int:tienda_id>', methods=['GET'])
@vendedor_required
def misVendedores(tienda_id):
    try:
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            return jsonify({"error": "No perteneces a esta tienda"}), 403

        colaboradores = Usuarios.query.join(UsuarioTienda).filter(UsuarioTienda.tienda_id == tienda_id).all()
        return jsonify([colaborador.serialize() for colaborador in colaboradores]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Actualizar datos del usuario firmado
@api.route('/usuario/actDtos', methods=['PUT'])
@vendedor_required
def actualizarDatosVendedor():
    try:
        request_body = request.get_json()
        if not request_body:
            return jsonify({"error": "Datos incompletos"}), 400

        auth = get_jwt()  # Log para debugging
        usuario = Usuarios.query.get(auth.get("sub"))
        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
        if auth.get("rol") == "ceo":
            for key, value in request_body.items():
                if key != 'email' and hasattr(usuario, key):
                    setattr(usuario, key, value)
        else:
            for key, value in request_body.items():
                if key == 'nombre' or 'contraseña' or "apellido" and hasattr(usuario, key):
                    setattr(usuario, key, value)
        db.session.commit()

        return jsonify(usuario.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# Actualizar datos otro usuario (CEO)
@api.route('/usuario/actDtosCeo', methods=['PUT'])
@ceo_required
def actualizarDatosAdmin():
    try:
        request_body = request.get_json()
        if not request_body:
            return jsonify({"error": "Datos incompletos"}), 400
        tienda = Tienda.query.get(request_body["tienda_id"])
        usuario = Usuarios.query.get(request_body["email"])
        
        if not usuario or not tienda:
            return jsonify({"error": "Usuario o tienda no encontrado"}), 404
        relacionCheck = UsuarioTienda.query.filter_by(
            usuario_email=request_body["email"],
            tienda_id=request_body["tienda_id"]).first()
        
        if not relacionCheck:
            return jsonify({"error": "Usuario no pertenece a la tienda"}), 404
        
        for key, value in request_body.items():
            if key != 'email' and hasattr(usuario, key):
                setattr(usuario, key, value)
        db.session.commit()

        return jsonify(usuario.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Eliminar usuario (desactivar)
@api.route('/usuario/eliminar', methods=['PUT'])
@ceo_required
def eliminarUsuario():
    try:
        request_body = request.get_json()
        if not request_body:
            return jsonify({"error": "Datos incompletos"}), 400
        
        usuario = Usuarios.query.get(request_body["email"])
        tienda = Tienda.query.get(request_body["tienda_id"])
        if not usuario or not tienda:
            return jsonify({"error": "Usuario o tienda no encontrado"}), 404
        
        relacionCheck = UsuarioTienda.query.filter_by(
            usuario_email=request_body["email"],
            tienda_id=request_body["tienda_id"]).first()
        
        if not relacionCheck:
            return jsonify({"error": "Usuario no pertenece a la tienda"}), 404
        
        usuario.is_active = False
        db.session.commit()
        return jsonify({"message": "Usuario eliminado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ==============================
# RUTAS DE CLIENTES
# ==============================

@api.route('/cliente/crear', methods=['POST'])
@vendedor_required
def crear_cliente():
    try:
        data = request.get_json()
        email = get_jwt_identity()

        cliente = Cliente(
            nombre=data["nombre"],
            apellido=data["apellido"],
            email=data.get("email"),
            telefono=data.get("telefono"),
            tienda_id=data["tienda_id"],  # Relación con tienda
            creado_por=email  # Relación con usuario
        )
        db.session.add(cliente)
        db.session.commit()
        return jsonify(cliente.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@api.route('/clientes/<int:tienda_id>', methods=['GET'])
@vendedor_required
def obtener_clientes(tienda_id):
    try:
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            return jsonify({"error": "No autorizado"}), 403

        clientes = Cliente.query.filter_by(tienda_id=tienda_id).all()
        return jsonify([cliente.serialize() for cliente in clientes]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@api.route('/cliente/<int:cliente_id>', methods=['PUT'])
@vendedor_required
def actualizar_cliente(cliente_id):
    try:
        data = request.get_json()
        cliente = Cliente.query.get(cliente_id)
        error = ""
        cuenta = 0
        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404
        for key, value in data.items():
            if hasattr(cliente, key):
                setattr(cliente, key, value)
                cuenta += 1
            else:
                error = f"Campo {key} no existe"
        db.session.commit()
        
        if error != "" and cuenta == 0:
            return jsonify({"error": error}), 400
        if error != "" and cuenta > 0:
            return jsonify({
                "error": error
                }), 200
        return jsonify(cliente.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# ==============================
# RUTAS DE PROVEEDORES
# ==============================

@api.route('/proveedor', methods=['POST'])
@admin_required
def crear_proveedor():
    try:
        data = request.get_json()
        email = get_jwt_identity()

        proveedor = Proveedor(
            nombre=data["nombre"],
            contacto=data.get("contacto"),
            telefono=data.get("telefono"),
            email=data.get("email"),
            direccion=data.get("direccion"),
            creado_por=email  # Relación con usuario
        )
        db.session.add(proveedor)

        # Asociar proveedor con tiendas
        for tienda_id in data.get("tienda_ids", []):
            asociacion = ProveedorTienda(proveedor_id=proveedor.id, tienda_id=tienda_id)
            db.session.add(asociacion)

        db.session.commit()
        return jsonify(proveedor.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ==============================
# RUTAS DE TIENDAS
# ==============================

# Obtener tiendas del CEO
@api.route('/tiendas', methods=['GET'])
@ceo_required
def get_tiendas():
    try:
        email = get_jwt_identity()
        tiendas = Tienda.query.join(UsuarioTienda).filter(UsuarioTienda.usuario_email == email).all()
        if not tiendas:
            return jsonify({"error": "No se encontraron tiendas"}), 404
        
        return jsonify({
            "tiendas": [tienda.serialize() for tienda in tiendas]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Obtener tienda de un trabajador
@api.route('/tienda', methods=['GET'])
@vendedor_required
def get_tienda():
    try:
        email = get_jwt_identity()
        tienda = UsuarioTienda.query.filter_by(usuario_email=email).first().tienda
        return jsonify(tienda.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Crear nueva tienda
@api.route('/nuevaTienda', methods=['POST'])
@ceo_required
def nueva_tienda():
    try:
        data = request.get_json()
        email = get_jwt_identity()

        nueva_tienda = Tienda(
            nombre=data["nombre"],
            direccion=data["direccion"],
            hora_apertura=data["hora_apertura"],
            hora_cierre=data["hora_cierre"]
        )
        db.session.add(nueva_tienda)
        db.session.flush()

        relacion = UsuarioTienda(
            usuario_email=email,
            tienda_id=nueva_tienda.id,
            rol='ceo'
        )
        db.session.add(relacion)
        db.session.commit()

        return jsonify(nueva_tienda.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ==============================
# RUTAS DE PRODUCTOS
# ==============================

# TODO: no funciona, o lo arreglo o lo hago con scrapping

# Consultar producto por código de barras
@api.route('/productoCB', methods=['PUT'])
@vendedor_required
def consultarProducto():
    try:
        request_body = request.get_json()
        codigoBarras = request_body["codigoBarras"]

        consulta = lector.product.get(codigoBarras, fields=[
            "code", "brands", "product_name", "product_quantity", "product_quantity_unit", "ingredients_text", "categories_tags"
        ])
        if not consulta:
            return jsonify({"error": "Producto no encontrado"}), 404

        return jsonify(consulta), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Agregar producto
@api.route('/producto', methods=['POST'])
@vendedor_required
def agregarProducto():
    try:
        data = request.get_json()
        email = get_jwt_identity()
        rel_usuario_tienda = UsuarioTienda.query.filter_by(usuario_email=email).first()

        producto = Producto(
            nombre=data["nombre"],
            descripcion=data["descripcion"],
            categoria=data["categoria"],
            marca=data["marca"],
            precio=data["precio"],
            codigoBarras=data["codigoBarras"],
            tienda_id=rel_usuario_tienda.tienda_id
        )
        db.session.add(producto)
        db.session.flush()

        inventario = Inventario(
            tienda_id=rel_usuario_tienda.tienda_id,
            producto_id=producto.id,
            cantidad=data.get("cantidad", 0)
        )
        db.session.add(inventario)
        db.session.commit()

        return jsonify(producto.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Obtener productos por codigo de barras
@api.route('/producto/<string:codigoBarras>', methods=['GET'])
@vendedor_required
def obtenerProducto(codigoBarras):
    try:
        producto = Producto.query.filter_by(codigoBarras=codigoBarras).first()
        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404
        return jsonify(producto.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ==============================
# RUTAS DE INVENTARIO
# ==============================

# Obtener inventario global (CEO)
@api.route('/inventario/global', methods=['GET'])
@ceo_required
def inventario_global():
    try:
        email = get_jwt_identity()
        tiendas = UsuarioTienda.query.filter_by(usuario_email=email).all()
        if not tiendas:
            return jsonify({"error": "No se encontraron tiendas"}), 404
        inventario = Inventario.query.filter(Inventario.tienda_id.in_([tienda.tienda_id for tienda in tiendas])).all()
        if not inventario:
            return jsonify({"error": "No se encontraron productos"}), 404
        return jsonify([stock.serialize() for stock in inventario]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Obtener inventario de una tienda
@api.route('/inventario/<int:tienda_id>', methods=['GET'])
@vendedor_required
def inventario_tienda(tienda_id):
    try:
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            return jsonify({"error": "No perteneces a esta tienda"}), 403

        inventario = Inventario.query.filter_by(tienda_id=tienda_id).all()
        return jsonify([stock.serialize() for stock in inventario]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Agregar productos al inventario
@api.route('/inventario/agregar', methods=['POST'])
@vendedor_required
def agregar_inventario():
    try:
        data = request.json
        producto_id = data.get('producto_id')
        cantidad = data.get('cantidad')

        inventario = Inventario.query.filter_by(tienda_id=data["tienda_id"], producto_id=producto_id).first()
        if inventario:
            inventario.cantidad += cantidad
        else:
            inventario = Inventario(tienda_id=data["tienda_id"], producto_id=producto_id, cantidad=cantidad)
            db.session.add(inventario)

        db.session.commit()
        return jsonify({"message": "Inventario actualizado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Editar inventario
@api.route('/inventario/editar/<int:inventario_id>', methods=['PUT'])
@vendedor_required
def editar_inventario(inventario_id):
    try:
        data = request.json
        stock = Inventario.query.get(inventario_id)

        stock.cantidad = data['cantidad']
        stock.producto_id = data['producto_id']
        db.session.commit()

        return jsonify(stock.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ==============================
# RUTAS DE DASHBOARD Y ESTADÍSTICAS
# ==============================

# Obtener estadísticas del dashboard
@api.route('/dashboard/stats/<int:tienda_id>', methods=['GET'])
@vendedor_required
def get_dashboard_stats(tienda_id):
    try:
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            return jsonify({"error": "No autorizado"}), 403

        today = datetime.now().date()

        ventas_dia = Ticket.query.filter(
            Ticket.tienda_id == tienda_id,
            func.date(Ticket.fecha) == today
        ).with_entities(func.sum(Ticket.total)).scalar() or 0

        productos_bajo_stock = Inventario.query.filter(
            Inventario.tienda_id == tienda_id,
            Inventario.cantidad <= Inventario.cantidad_minima
        ).count()

        total_productos = Inventario.query.filter_by(tienda_id=tienda_id).count()

        ultimos_tickets = Ticket.query.filter_by(tienda_id=tienda_id).order_by(Ticket.fecha.desc()).limit(5).all()

        return jsonify({
            "ventas_dia": float(ventas_dia),
            "productos_bajo_stock": productos_bajo_stock,
            "total_productos": total_productos,
            "ultimos_tickets": [ticket.serialize() for ticket in ultimos_tickets]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ==============================
# RUTAS DE VENTAS (TICKETS)
# ==============================

# Crear ticket
@api.route('/ticket/<int:tienda_id>', methods=['POST'])
@vendedor_required
def crear_ticket(tienda_id):
    try:
        data = request.get_json()
        email = get_jwt_identity()
        ticket = Ticket(
            id= data.get("id"),
            fecha=datetime.now(),
            tienda_id=tienda_id,
            vendedor_id=email,
            cliente_id=data.get("cliente_id"),
            estado=data.get("estado"),
            metodo_pago=data.get("metodo_pago"),
            subtotal=data.get("subtotal"),
            impuestos=data.get("impuestos"),
            descuento=data.get("descuento"),
            total=data.get("total"),
            productos=data.get("productos")
        )
        db.session.add(ticket)
        db.session.commit()
        return jsonify(ticket.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
