from flask import request, jsonify, Blueprint, make_response, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, get_jwt_identity, jwt_required
from api.models import db, Usuarios, Tienda, Producto, Inventario, UsuarioTienda, TokenBlocklist, LoginHistory, Caja, MovimientoCaja, Venta, DetalleVenta, Estadisticas, HistorialPrecio, MovimientoInventario, Compra, DetalleCompra
from api.utils import contraseñaAleatoria
from api.decoradores import vendedor_required, ceo_required, admin_required
from api.crear_registros import crear_registros
from api.crear_operaciones import crear_operaciones
from api.borrar_db import borrar_bd
from datetime import timedelta, datetime, timezone
from sqlalchemy import func, desc, case, and_, or_

api = Blueprint('api', __name__)

# ==============================
# RUTAS DE SEGURIDAD
# ==============================

# Ruta para iniciar sesión
@api.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('contraseña')
        
        user = Usuarios.query.filter_by(email=email).first()
        if user and user.check_password(password):
            access_token = create_access_token(
                identity=email,
                expires_delta=timedelta(minutes=15)
            )
            refresh_token = create_refresh_token(
                identity=email,
                expires_delta=timedelta(days=30)
            )
            
            # Crear respuesta
            response = make_response(jsonify({
                "data": {
                    "datos": user.serialize(),
                    "access_token": access_token
                }
            }))
            
            # Configurar cookie segura para refresh_token
            response.set_cookie(
                'refresh_token',
                refresh_token,
                httponly=True,
                secure=True,
                samesite='Strict',
                max_age=timedelta(days=30),
                path='/api/refresh'
            )
            
            return response, 200
            
        return jsonify({"error": "Credenciales inválidas"}), 401
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user)
        
        return jsonify({
            "access_token": access_token
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Logout exitoso"}))
    response.delete_cookie('refresh_token', path='/api/refresh')
    return response, 200

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
            fecha_contratacion=datetime.strptime(request_body["usuario"]["fecha_contratacion"], '%Y-%m-%d').date(),
            hora_entrada=datetime.strptime(request_body["usuario"]["hora_entrada"], '%H:%M').time(),
            hora_salida=datetime.strptime(request_body["usuario"]["hora_salida"], '%H:%M').time(),
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
        
        caja_inicial = Caja(
            tienda_id=nueva_tienda.id,
            monto_inicial=0,
            estado='cerrada',
            usuario_apertura_id=nuevo_ceo.email
        )
        db.session.add(caja_inicial)

        access_token = create_access_token(
            identity=nuevo_ceo.email,
            expires_delta=timedelta(minutes=15),
            additional_claims={"rol": rel_ceo_tienda.rol}
        )
        
        refresh_token = create_refresh_token(
            identity=nuevo_ceo.email,
            expires_delta=timedelta(days=30)
        )
        
        login_history = LoginHistory(
            usuario_email=nuevo_ceo.email,
            tienda_id=nueva_tienda.id,
            ip_address=request.remote_addr
        )
        db.session.add(login_history)
        db.session.commit()
        
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
        usuario.set_password(request_body["contraseña"])
        db.session.add(usuario)
        db.session.flush()

        relacion = UsuarioTienda(
            usuario_email=usuario.email,
            tienda_id=request_body["tienda_id"],
            rol=request_body["rol"] if request_body["rol"] in ["administrador", "vendedor"] else "vendedor"
        )
        db.session.add(relacion)
        db.session.commit()

        return jsonify({
            "usuario": usuario.serialize(),
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
        print(colaboradores)
        return jsonify([colaborador.serialize() for colaborador in colaboradores]), 200
    except Exception as e:
        print(e)
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
    
@api.route('/usuario/historial/<string:email>', methods=['GET'])
@admin_required
def get_user_history(email):
    try:
        # Verificar si el usuario existe
        usuario = Usuarios.query.get(email)
        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Obtener ventas realizadas
        ventas = Venta.query.filter_by(vendedor_id=email).order_by(Venta.fecha.desc()).all()
        
        # Obtener historial de login
        login_history = LoginHistory.query.filter_by(usuario_email=email).order_by(LoginHistory.login_time.desc()).all()
        
        # Obtener movimientos de caja
        movimientos_caja = MovimientoCaja.query.filter_by(usuario_id=email).order_by(MovimientoCaja.fecha.desc()).all()
        
        return jsonify({
            "usuario": usuario.serialize(),
            "ventas": [{
                "id": v.id,
                "fecha": v.fecha.strftime('%Y-%m-%d %H:%M:%S'),
                "total": float(v.total),
                "estado": v.estado,
                "tienda": v.tienda.nombre
            } for v in ventas],
            "login_history": [{
                "fecha": h.login_time.strftime('%Y-%m-%d %H:%M:%S'),
                "tienda": Tienda.query.get(h.tienda_id).nombre,
                "ip": h.ip_address
            } for h in login_history],
            "movimientos_caja": [{
                "fecha": m.fecha.strftime('%Y-%m-%d %H:%M:%S'),
                "tipo": m.tipo,
                "concepto": m.concepto,
                "monto": float(m.monto)
            } for m in movimientos_caja]
        }), 200
    except Exception as e:
        print(f"Error en get_user_history: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ==============================
# RUTAS DE CAJA
# ==============================

@api.route('/caja/estado/<int:tienda_id>', methods=['GET'])
@vendedor_required
def verificar_caja(tienda_id):
    try:
        caja = Caja.query.filter_by(tienda_id=tienda_id, estado='abierta').first()
        if caja:
            return jsonify({
                "estado": "abierta",
                "caja": caja.serialize(),
                "movimientos": [m.serialize() for m in caja.movimientos],
                "balance_actual": caja.calcular_balance()
            }), 200
        return jsonify({"estado": "cerrada"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/caja/abrir', methods=['POST'])
@vendedor_required
def abrir_caja():
    try:
        data = request.get_json()
        email = get_jwt_identity()
        
        caja = Caja(
            tienda_id=data['tienda_id'],
            monto_inicial=data['monto_inicial'],
            usuario_apertura_id=email
        )
        db.session.add(caja)
        db.session.commit()
        
        return jsonify(caja.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/caja/cerrar/<int:caja_id>', methods=['PUT'])
@vendedor_required
def cerrar_caja(caja_id):
    try:
        data = request.get_json()
        email = get_jwt_identity()
        
        caja = Caja.query.get(caja_id)
        if not caja:
            return jsonify({"error": "Caja no encontrada"}), 404
            
        caja.estado = 'cerrada'
        caja.fecha_cierre = datetime.now(timezone.utc)
        caja.monto_final = data['monto_final']
        caja.usuario_cierre_id = email
        
        db.session.commit()
        
        return jsonify(caja.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/caja/movimiento', methods=['POST'])
@vendedor_required
def registrar_movimiento():
    try:
        data = request.get_json()
        email = get_jwt_identity()
        
        movimiento = MovimientoCaja(
            caja_id=data['caja_id'],
            tipo=data['tipo'],
            concepto=data['concepto'],
            monto=data['monto'],
            usuario_id=email,
            observacion=data.get('observacion')
        )
        db.session.add(movimiento)
        db.session.commit()
        
        return jsonify({
            "movimiento": movimiento.serialize(),
            "balance_actual": movimiento.caja.calcular_balance()
        }), 201
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
            "tiendas": [tienda.serialize() for tienda in tiendas],
            "estadisticas": [tienda.get_estadisticas() for tienda in tiendas]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# obtener la informacion de una sola tienda y su estado de caja
@api.route("/tienda/<int:tienda_id>", methods=["GET"])
@vendedor_required
def get_tienda(tienda_id):
    try:
        email = get_jwt_identity()
        
        # Verificar si el usuario pertenece a la tienda
        if not UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            return jsonify({"error": "No autorizado para esta tienda"}), 403
        
        # Obtener la tienda
        tienda = Tienda.query.get(tienda_id)
        if not tienda:
            return jsonify({"error": "Tienda no encontrada"}), 404
        
        # Obtener el estado de la caja
        caja = Caja.query.filter_by(tienda_id=tienda_id).first()
        if caja.estado == 'cerrada':
            caja_info ={
				"caja": caja.serialize(),
				"estado": "cerrada"
			}
        if caja.estado == 'abierta':
            caja_info = {
                "estado": "abierta",
                "caja": caja.serialize(),
                "movimientos": [m.serialize() for m in caja.movimientos],
                "balance_actual": caja.calcular_balance()
            }
        
        # Obtener estadísticas de la tienda
        fecha_fin = datetime.now()
        fecha_inicio = fecha_fin - timedelta(days=30)  # Últimos 30 días

        # Obtener estadísticas consolidadas
        stats = Estadisticas.obtener_estadisticas_consolidadas(fecha_inicio, fecha_fin, [tienda_id])

        # Obtener estadísticas diarias
        stats_diarias = Estadisticas.calcular_estadisticas_diarias(tienda_id, fecha_inicio, fecha_fin)

        # Combinar resultados
        stats['estadisticas_diarias'] = stats_diarias

        return jsonify({
            "tienda": tienda.serialize(),
            "caja": caja_info,
            "estadisticas": stats
        }), 200
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
    
@api.route('/tienda/<int:tienda_id>', methods=['PUT'])
@admin_required
def editar_tienda(tienda_id):
    try:
        data = request.get_json()
        email = get_jwt_identity()

        # Verificar autorización
        usuario_tienda = UsuarioTienda.query.filter_by(
            usuario_email=email,
            tienda_id=tienda_id
        ).first()
        if not usuario_tienda:
            return jsonify({"error": "No autorizado para esta tienda"}), 403

        tienda = Tienda.query.get(tienda_id)
        if not tienda:
            return jsonify({"error": "Tienda no encontrada"}), 404

        # Actualizar campos de la tienda
        campos_actualizables = ['nombre', 'direccion', 'hora_apertura', 'hora_cierre']
        for campo in campos_actualizables:
            if campo in data:
                if campo in ['hora_apertura', 'hora_cierre']:
                    setattr(tienda, campo, datetime.strptime(data[campo], '%H:%M').time())
                else:
                    setattr(tienda, campo, data[campo])

        db.session.commit()
        return jsonify(tienda.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@api.route('/tienda/<int:tienda_id>/historial/usuarios', methods=['GET'])
@admin_required
def obtener_historial_usuarios(tienda_id):
    try:
        # Verificar autorización
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            return jsonify({"error": "No autorizado para esta tienda"}), 403

        # Parámetros de filtrado
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        tipo_evento = request.args.get('tipo')  # creacion, actualizacion, desactivacion

        # Consulta base
        query = db.session.query(
            UsuarioTienda,
            LoginHistory
        ).join(
            LoginHistory,
            and_(
                UsuarioTienda.usuario_email == LoginHistory.usuario_email,
                UsuarioTienda.tienda_id == LoginHistory.tienda_id
            )
        ).filter(UsuarioTienda.tienda_id == tienda_id)

        # Aplicar filtros
        if fecha_inicio and fecha_fin:
            query = query.filter(LoginHistory.login_time.between(fecha_inicio, fecha_fin))

        historial = query.order_by(LoginHistory.login_time.desc()).all()

        return jsonify({
            "historial_usuarios": [{
                "usuario": user.usuario.serialize(),
                "rol": user.rol,
                "ultimo_login": login.login_time.strftime('%Y-%m-%d %H:%M:%S'),
                "ip": login.ip_address,
                "created_at": user.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                "updated_at": user.updated_at.strftime('%Y-%m-%d %H:%M:%S') if user.updated_at else None
            } for user, login in historial]
        }), 200

    except Exception as e:
        print(f"Error en obtener_historial_usuarios: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/tienda/<int:tienda_id>/historial/inventario', methods=['GET'])
@vendedor_required
def obtener_historial_inventario(tienda_id):
    try:
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            return jsonify({"error": "No autorizado para esta tienda"}), 403

        # Parámetros
        producto_id = request.args.get('producto_id', type=int)
        tipo_movimiento = request.args.get('tipo')  # entrada, salida, ajuste
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')

        # Consulta base
        query = MovimientoInventario.query.join(
            Inventario
        ).filter(Inventario.tienda_id == tienda_id)

        # Aplicar filtros
        if producto_id:
            query = query.filter(Inventario.producto_id == producto_id)
        if tipo_movimiento:
            query = query.filter(MovimientoInventario.tipo == tipo_movimiento)
        if fecha_inicio and fecha_fin:
            query = query.filter(MovimientoInventario.fecha.between(fecha_inicio, fecha_fin))

        movimientos = query.order_by(MovimientoInventario.fecha.desc()).all()

        return jsonify({
            "historial_inventario": [{
                "fecha": m.fecha.strftime('%Y-%m-%d %H:%M:%S'),
                "tipo": m.tipo,
                "cantidad": float(m.cantidad),
                "motivo": m.motivo,
                "producto": Producto.query.get(m.inventario.producto_id).serialize(),
                "usuario": Usuarios.query.get(m.usuario_id).nombre,
                "documento_id": m.documento_id
            } for m in movimientos]
        }), 200

    except Exception as e:
        print(f"Error en obtener_historial_inventario: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@api.route('/tienda/<int:tienda_id>/historial/ventas_compras', methods=['GET'])
@vendedor_required
def obtener_historial_ventas_compras(tienda_id):
    try:
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            return jsonify({"error": "No autorizado"}), 403

        # Parámetros de filtrado
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')

        # Obtener ventas del período
        query_ventas = Venta.query.filter_by(tienda_id=tienda_id)
        if fecha_inicio and fecha_fin:
            query_ventas = query_ventas.filter(Venta.fecha.between(fecha_inicio, fecha_fin))
        ventas = query_ventas.order_by(Venta.fecha.desc()).all()

        # Obtener compras del período
        query_compras = Compra.query.filter_by(tienda_id=tienda_id)
        if fecha_inicio and fecha_fin:
            query_compras = query_compras.filter(Compra.fecha.between(fecha_inicio, fecha_fin))
        compras = query_compras.order_by(Compra.fecha.desc()).all()

        return jsonify({
            "ventas": [v.serialize() for v in ventas],
            "compras": [c.serialize() for c in compras]
        }), 200

    except Exception as e:
        print(f"Error en obtener_historial_ventas_compras: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/tienda/<int:tienda_id>/historial/caja', methods=['GET'])
@vendedor_required
def obtener_historial_caja(tienda_id):
    try:
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            return jsonify({"error": "No autorizado para esta tienda"}), 403

        # Parámetros
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        tipo_movimiento = request.args.get('tipo')  # entrada, salida

        # Obtener cajas del período
        query = Caja.query.filter_by(tienda_id=tienda_id)
        if fecha_inicio and fecha_fin:
            query = query.filter(Caja.fecha_apertura.between(fecha_inicio, fecha_fin))

        cajas = query.order_by(Caja.fecha_apertura.desc()).all()

        return jsonify({
            "historial_cajas": [{
                "caja": caja.serialize(),
                "movimientos": [{
                    "fecha": m.fecha.strftime('%Y-%m-%d %H:%M:%S'),
                    "tipo": m.tipo,
                    "concepto": m.concepto,
                    "monto": float(m.monto),
                    "usuario": m.usuario.nombre,
                    "venta_id": m.venta_id,
                    "compra_id": m.compra_id,
                    "observacion": m.observacion
                } for m in caja.movimientos if not tipo_movimiento or m.tipo == tipo_movimiento]
            } for caja in cajas]
        }), 200

    except Exception as e:
        print(f"Error en obtener_historial_caja: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/tienda/<int:tienda_id>/historial/precios', methods=['GET'])
@vendedor_required
def obtener_historial_precios(tienda_id):
    try:
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            return jsonify({"error": "No autorizado para esta tienda"}), 403

        # Parámetros
        producto_id = request.args.get('producto_id', type=int)
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')

        # Consulta base
        query = HistorialPrecio.query.filter_by(tienda_id=tienda_id)

        # Aplicar filtros
        if producto_id:
            query = query.filter_by(producto_id=producto_id)
        if fecha_inicio and fecha_fin:
            query = query.filter(HistorialPrecio.fecha_inicio.between(fecha_inicio, fecha_fin))

        historiales = query.order_by(HistorialPrecio.fecha_inicio.desc()).all()

        return jsonify({
            "historial_precios": [{
                "producto": Producto.query.get(h.producto_id).serialize(),
                "precio_compra": float(h.precio_compra),
                "precio_venta": float(h.precio_venta),
                "margen": float((h.precio_venta - h.precio_compra) / h.precio_compra * 100),
                "fecha_inicio": h.fecha_inicio.strftime('%Y-%m-%d %H:%M:%S'),
                "fecha_fin": h.fecha_fin.strftime('%Y-%m-%d %H:%M:%S') if h.fecha_fin else None
            } for h in historiales]
        }), 200

    except Exception as e:
        print(f"Error en obtener_historial_precios: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@api.route('/tienda/<int:tienda_id>/inventario/buscar', methods=['GET'])
@vendedor_required
def buscar_en_inventario(tienda_id):
    try:
        query = request.args.get('query', '')
        
        # Búsqueda en inventario local
        productos = db.session.query(
            Producto, Inventario, HistorialPrecio
        ).join(
            Inventario, Producto.id == Inventario.producto_id
        ).outerjoin(
            HistorialPrecio, and_(
                Producto.id == HistorialPrecio.producto_id,
                HistorialPrecio.fecha_fin == None
            )
        ).filter(
            Inventario.tienda_id == tienda_id,
            or_(
                Producto.codigo.ilike(f'%{query}%'),
                Producto.nombre.ilike(f'%{query}%')
            )
        ).limit(10).all()
        
        return jsonify([{
            **producto.serialize(),
            'inventario': {
                'cantidad': inventario.cantidad,
                'cantidad_minima': inventario.cantidad_minima,
                'cantidad_maxima': inventario.cantidad_maxima
            },
            'precios': {
                'compra': float(historial.precio_compra) if historial else None,
                'venta': float(historial.precio_venta) if historial else None
            }
        } for producto, inventario, historial in productos]), 200
        
    except Exception as e:
        print(f"Error en buscar_en_inventario: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ==============================
# RUTAS DE PRODUCTOS
# ==============================
    
# Crear nuevo producto
@api.route('/producto/registrar', methods=['POST'])
@vendedor_required
def registrar_producto():
    try:
        data = request.get_json()

        # Crear el producto
        producto = Producto(
            codigo=data['codigo'],
            nombre=data['nombre'],
            descripcion=data.get('descripcion'),
            categoria=data['categoria'],
            marca=data['marca'],
            unidad_medida=data['unidad_medida']
        )
        db.session.add(producto)
        db.session.commit()
        return producto.serialize(), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# Actualizar producto
@api.route('/producto/<int:producto_id>', methods=['PUT'])
@admin_required
def actualizar_producto(producto_id):
    try:
        data = request.get_json()
        producto = Producto.query.get(producto_id)
        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        # Actualizar campos del producto
        for campo in ['codigo', 'nombre', 'descripcion', 'categoria', 'marca', 'unidad_medida']:
            if campo in data:
                setattr(producto, campo, data[campo])

        # Si hay cambio de precios, crear nuevo historial
        if 'precio_compra' in data or 'precio_venta' in data:
            historial_actual = HistorialPrecio.query.filter_by(
                producto_id=producto_id,
                tienda_id=data['tienda_id'],
                fecha_fin=None
            ).first()
            
            if historial_actual:
                historial_actual.fecha_fin = datetime.now(timezone.utc)
                
            nuevo_historial = HistorialPrecio(
                producto_id=producto_id,
                tienda_id=data['tienda_id'],
                precio_compra=data.get('precio_compra', historial_actual.precio_compra),
                precio_venta=data.get('precio_venta', historial_actual.precio_venta)
            )
            db.session.add(nuevo_historial)

        db.session.commit()
        return jsonify(producto.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Obtener productos por codigo de barras
@api.route('/productos/buscar', methods=['GET'])
@vendedor_required
def buscar_productos():
    try:
        query = request.args.get('query', '')
        
        # Búsqueda por código o nombre
        productos = Producto.query.filter(
            or_(
                Producto.codigo.ilike(f'%{query}%'),
                Producto.nombre.ilike(f'%{query}%'),
                Producto.marca.ilike(f'%{query}%'),
                Producto.categoria.ilike(f'%{query}%')
            )
        ).limit(10).all()
        
        return jsonify([producto.serialize() for producto in productos]), 200
        
    except Exception as e:
        print(f"Error en buscar_productos: {str(e)}")
        return jsonify({"error": str(e)}), 500
        
    except Exception as e:
        print(f"Error en buscar_productos: {str(e)}")
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
        inventario = Inventario.query.filter_by(tienda_id=tienda_id).all()
        inventario_serializado = []
        for item in inventario:
            producto = item.producto
            historial_precio = HistorialPrecio.query.filter_by(
                producto_id=producto.id, 
                tienda_id=tienda_id
            ).order_by(HistorialPrecio.fecha_inicio.desc()).first()
            inventario_serializado.append({
                "id_inventario": item.id,
                "producto": producto.serialize(),
                "cantidad": item.cantidad,
                "cantidad_minima": item.cantidad_minima,
                "cantidad_maxima": item.cantidad_maxima,
                "ubicacion": item.ubicacion,
                "precio_actual": {
                    "compra": float(historial_precio.precio_compra) if historial_precio else None,
                    "venta": float(historial_precio.precio_venta) if historial_precio else None
                }
            })
        return jsonify(inventario_serializado), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Agregar productos al inventario
@api.route('/inventario/agregar', methods=['POST'])
@vendedor_required
def agregar_inventario():
    try:
        data = request.get_json()
        producto_id = data.get('producto_id')
        cantidad = data.get('cantidad')
        tienda_id = data.get('tienda_id')
        email = get_jwt_identity()

        # Verificar si el producto ya existe en el inventario de la tienda
        inventario = Inventario.query.filter_by(tienda_id=tienda_id, producto_id=producto_id).first()
        if inventario:
            inventario.cantidad += cantidad
        else:
            inventario = Inventario(tienda_id=tienda_id, producto_id=producto_id, cantidad=cantidad)
            db.session.add(inventario)

        # Registrar movimiento de inventario
        movimiento = MovimientoInventario(
            inventario_id=inventario.id,
            tipo='entrada',
            cantidad=cantidad,
            motivo='agregar',
            usuario_id=email
        )
        db.session.add(movimiento)

        db.session.commit()
        return jsonify({"message": "Inventario actualizado y movimiento registrado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@api.route('/merma', methods=['POST'])
@admin_required
def registrar_merma():
    try:
        data = request.get_json()
        email = get_jwt_identity()

        # Verificar inventario
        inventario = Inventario.query.filter_by(
            tienda_id=data['tienda_id'],
            producto_id=data['producto_id']
        ).first()

        if not inventario or inventario.cantidad < data['cantidad']:
            return jsonify({"error": "Stock insuficiente"}), 400

        # Registrar merma
        merma = Merma(
            inventario_id=inventario.id,
            cantidad=data['cantidad'],
            motivo=data['motivo'],
            costo=data['costo'],
            usuario_id=email
        )
        db.session.add(merma)

        # Actualizar inventario
        inventario.cantidad -= data['cantidad']

        # Registrar movimiento de inventario
        movimiento = MovimientoInventario(
            inventario_id=inventario.id,
            tipo='salida',
            cantidad=data['cantidad'],
            motivo='merma',
            usuario_id=email
        )
        db.session.add(movimiento)

        db.session.commit()
        return jsonify({
            "mensaje": "Merma registrada exitosamente",
            "merma": {
                "id": merma.id,
                "producto": inventario.producto.serialize(),
                "cantidad": float(merma.cantidad),
                "motivo": merma.motivo,
                "costo": float(merma.costo),
                "fecha": merma.fecha.strftime('%Y-%m-%d %H:%M:%S')
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


    
@api.route('/inventario/<int:inventario_id>', methods=['PUT'])
@vendedor_required
def actualizar_inventario(inventario_id):
    try:
        data = request.get_json()
        inventario = Inventario.query.get(inventario_id)
        if not inventario:
            return jsonify({"error": "Inventario no encontrado"}), 404

        for campo in ['cantidad', 'cantidad_minima', 'cantidad_maxima', 'ubicacion']:
            if campo in data:
                setattr(inventario, campo, data[campo])

        db.session.commit()
        return jsonify(inventario.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@api.route('/inventario/<int:inventario_id>', methods=['DELETE'])
@vendedor_required
def eliminar_inventario(inventario_id):
    try:
        inventario = Inventario.query.get(inventario_id)
        if not inventario:
            return jsonify({"error": "Inventario no encontrado"}), 404

        db.session.delete(inventario)
        db.session.commit()
        return jsonify({"message": "Producto desvinculado del inventario"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



@api.route('/inventario/movimientos/<int:inventario_id>', methods=['GET'])
@vendedor_required
def obtener_movimientos_inventario(inventario_id):
    try:
        email = get_jwt_identity()
        inventario = Inventario.query.get(inventario_id)
        
        if not inventario:
            return jsonify({"error": "Inventario no encontrado"}), 404
            
        if not UsuarioTienda.query.filter_by(
            usuario_email=email, 
            tienda_id=inventario.tienda_id
        ).first():
            return jsonify({"error": "No autorizado"}), 403

        # Parámetros de filtrado
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        tipo = request.args.get('tipo')  # entrada, salida, ajuste

        query = MovimientoInventario.query.filter_by(inventario_id=inventario_id)

        if fecha_inicio and fecha_fin:
            query = query.filter(MovimientoInventario.fecha.between(fecha_inicio, fecha_fin))
        if tipo:
            query = query.filter_by(tipo=tipo)

        movimientos = query.order_by(MovimientoInventario.fecha.desc()).all()

        return jsonify({
            "producto": inventario.producto.serialize(),
            "movimientos": [{
                "fecha": m.fecha.strftime('%Y-%m-%d %H:%M:%S'),
                "tipo": m.tipo,
                "cantidad": float(m.cantidad),
                "motivo": m.motivo,
                "usuario": m.usuario.nombre,
                "documento_id": m.documento_id,
                "observacion": m.observacion
            } for m in movimientos]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================
# RUTAS DE DASHBOARD Y ESTADÍSTICAS
# ==============================

# Obtener estadísticas del dashboard
@api.route('/dashboard/stats/<int:tienda_id>', methods=['GET'])
@vendedor_required
def get_tienda_stats(tienda_id):
    try:
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            return jsonify({"error": "No autorizado"}), 403

        # Calcular fechas
        fecha_fin = datetime.now()
        fecha_inicio = fecha_fin - timedelta(days=30)  # último mes por defecto

        # Obtener estadísticas consolidadas
        stats = Estadisticas.obtener_estadisticas_consolidadas(
            fecha_inicio,
            fecha_fin,
            [tienda_id]
        )

        # Obtener estadísticas diarias
        stats_diarias = Estadisticas.calcular_estadisticas_diarias(
            tienda_id,
            fecha_inicio,
            fecha_fin
        )

        # Combinar resultados
        stats['estadisticas_diarias'] = stats_diarias

        return jsonify(stats), 200

    except Exception as e:
        print(f"Error en get_tienda_stats: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
# Estadísticas globales para CEO
@api.route('/dashboard/stats/global', methods=['GET'])
@ceo_required
def get_global_stats():
    try:
        email = get_jwt_identity()
        
        # Obtener IDs de las tiendas del CEO
        tiendas_ids = [rel.tienda_id for rel in UsuarioTienda.query.filter_by(
            usuario_email=email,
            rol='ceo'
        ).all()]

        periodo = request.args.get('periodo', default='mes')
        fecha_fin = datetime.now()
        
        if periodo == 'día':
            fecha_inicio = fecha_fin - timedelta(days=1)
        elif periodo == 'semana':
            fecha_inicio = fecha_fin - timedelta(weeks=1)
        elif periodo == 'año':
            fecha_inicio = fecha_fin - timedelta(days=365)
        else:  # mes
            fecha_inicio = fecha_fin - timedelta(days=30)

        # Obtener estadísticas consolidadas con los IDs de las tiendas
        estadisticas_consolidadas = Estadisticas.obtener_estadisticas_consolidadas(
            fecha_inicio, 
            fecha_fin,
            tiendas_ids
        )
        
        return jsonify({
            "tiendas": len(tiendas_ids),
            "estadisticas": estadisticas_consolidadas
        }), 200

    except Exception as e:
        print(f"Error en get_global_stats: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
# ==============================
# RUTAS DE VENTAS
# ==============================

@api.route('/venta', methods=['POST'])
@vendedor_required
def crear_venta():
    try:
        data = request.get_json()
        email = get_jwt_identity()

        # Validar que la caja esté abierta
        caja = Caja.query.filter_by(
            tienda_id=data['tienda_id'], 
            estado='abierta'
        ).first()
        if not caja:
            return jsonify({"error": "No hay caja abierta"}), 400

        # Crear la venta
        venta = Venta(
            tienda_id=data['tienda_id'],
            caja_id=caja.id,
            vendedor_id=email,
            cliente_id=data.get('cliente_id'),
            tipo_comprobante=data['tipo_comprobante'],
            numero_comprobante=data['numero_comprobante'],
            subtotal=data['subtotal'],
            impuestos=data['impuestos'],
            descuento=data.get('descuento', 0),
            total=data['total'],
            metodo_pago=data['metodo_pago']
        )
        db.session.add(venta)
        db.session.flush()

        # Procesar detalles de la venta y actualizar inventario
        for detalle in data['detalles']:
            det_venta = DetalleVenta(
                venta_id=venta.id,
                producto_id=detalle['producto_id'],
                cantidad=detalle['cantidad'],
                precio_unitario=detalle['precio_unitario'],
                descuento=detalle.get('descuento', 0),
                subtotal=detalle['subtotal']
            )
            db.session.add(det_venta)

            # Actualizar inventario
            inventario = Inventario.query.filter_by(
                tienda_id=data['tienda_id'],
                producto_id=detalle['producto_id']
            ).first()
            if not inventario or inventario.cantidad < detalle['cantidad']:
                db.session.rollback()
                return jsonify({"error": f"Stock insuficiente para el producto {detalle['producto_id']}"}), 400
            inventario.cantidad -= detalle['cantidad']

            # Registrar movimiento de inventario
            movimiento = MovimientoInventario(
                inventario_id=inventario.id,
                tipo='salida',
                cantidad=detalle['cantidad'],
                motivo='venta',
                documento_id=venta.id,
                usuario_id=email
            )
            db.session.add(movimiento)

        # Registrar movimiento en caja
        movimiento = MovimientoCaja(
            caja_id=caja.id,
            tipo='ingreso',
            concepto='venta',
            monto=data['total'],
            usuario_id=email,
            venta_id=venta.id
        )
        db.session.add(movimiento)

        db.session.commit()
        return jsonify({
            "mensaje": "Venta registrada exitosamente",
            "venta": venta.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@api.route('/venta/<int:venta_id>', methods=['GET'])
@vendedor_required
def obtener_venta(venta_id):
    try:
        email = get_jwt_identity()
        venta = Venta.query.get(venta_id)
        
        if not venta:
            return jsonify({"error": "Venta no encontrada"}), 404
            
        # Verificar permisos
        if not UsuarioTienda.query.filter_by(
            usuario_email=email, 
            tienda_id=venta.tienda_id
        ).first():
            return jsonify({"error": "No autorizado"}), 403

        return jsonify(venta.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/ventas/<int:tienda_id>', methods=['GET'])
@vendedor_required
def listar_ventas(tienda_id):
    try:
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(
            usuario_email=email, 
            tienda_id=tienda_id
        ).first():
            return jsonify({"error": "No autorizado"}), 403

        # Parámetros de filtrado
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        vendedor_id = request.args.get('vendedor_id')
        
        query = Venta.query.filter_by(tienda_id=tienda_id)
        
        if fecha_inicio and fecha_fin:
            query = query.filter(Venta.fecha.between(fecha_inicio, fecha_fin))
        if vendedor_id:
            query = query.filter_by(vendedor_id=vendedor_id)
            
        ventas = query.order_by(Venta.fecha.desc()).all()
        
        return jsonify([v.serialize() for v in ventas]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# RUTAS DE COMPRAS
# ==============================

@api.route('/compra', methods=['POST'])
@admin_required
def crear_compra():
    try:
        data = request.get_json()
        print(data)
        email = get_jwt_identity()

        # Validar que haya caja abierta
        caja = Caja.query.filter_by(
            tienda_id=data['tienda_id'], 
            estado='abierta'
        ).first()
        if not caja:
            return jsonify({"error": "No hay caja abierta"}), 400

        # Crear la compra
        compra = Compra(
            tienda_id=data['tienda_id'],
            usuario_id=email,
            tipo_comprobante=data['tipo_comprobante'],
            numero_comprobante=data['numero_comprobante'],
            subtotal=data['subtotal'],
            impuestos=data['impuestos'],
            total=data['total']
        )
        db.session.add(compra)
        db.session.flush()

        # Procesar detalles y actualizar inventario
        for detalle in data['detalles']:
            det_compra = DetalleCompra(
                compra_id=compra.id,
                producto_id=detalle['producto_id'],
                cantidad=detalle['cantidad'],
                precio_unitario=detalle['precio_unitario'],
                subtotal=detalle['subtotal']
            )
            db.session.add(det_compra)

            # Actualizar inventario
            inventario = Inventario.query.filter_by(
                tienda_id=data['tienda_id'],
                producto_id=detalle['producto_id']
            ).first()
            
            if inventario:
                inventario.cantidad += detalle['cantidad']
            else:
                inventario = Inventario(
                    tienda_id=data['tienda_id'],
                    producto_id=detalle['producto_id'],
                    cantidad=detalle['cantidad'],
                    cantidad_minima=0,
                    cantidad_maxima=100
                )
                db.session.add(inventario)

            # Registrar movimiento de inventario
            movimiento = MovimientoInventario(
                inventario_id=inventario.id,
                tipo='entrada',
                cantidad=detalle['cantidad'],
                motivo='compra',
                documento_id=compra.id,
                usuario_id=email
            )
            db.session.add(movimiento)

        # Registrar movimiento en caja
        movimiento_caja = MovimientoCaja(
            caja_id=caja.id,
            tipo='egreso',
            concepto='compra',
            monto=data['total'],
            usuario_id=email,
            compra_id=compra.id
        )
        db.session.add(movimiento_caja)
        db.session.commit()
        return jsonify({
            "mensaje": "Compra registrada exitosamente",
            "compra": compra.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ==============================
# RUTAS DE MOVIMIENTOS
# ==============================

@api.route('/movimiento/<int:movimiento_id>', methods=['GET'])
@vendedor_required
def obtener_movimiento(movimiento_id):
    try:
        email = get_jwt_identity()
        
        # Obtener el movimiento
        movimiento = MovimientoCaja.query.get(movimiento_id)
        if not movimiento:
            return jsonify({"error": "Movimiento no encontrado"}), 404
            
        # Verificar permisos
        caja = Caja.query.get(movimiento.caja_id)
        if not UsuarioTienda.query.filter_by(
            usuario_email=email, 
            tienda_id=caja.tienda_id
        ).first():
            return jsonify({"error": "No autorizado"}), 403

        # Obtener detalles adicionales según el tipo de movimiento
        detalles = None
        if movimiento.venta_id:
            detalles = Venta.query.get(movimiento.venta_id).serialize()
        elif movimiento.compra_id:
            detalles = Compra.query.get(movimiento.compra_id).serialize()

        return jsonify({
            "movimiento": movimiento.serialize(),
            "detalles": detalles,
            "usuario": Usuarios.query.get(movimiento.usuario_id).serialize(),
            "caja": caja.serialize()
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/movimientos/tienda/<int:tienda_id>', methods=['GET'])
@vendedor_required
def listar_movimientos(tienda_id):
    try:
        email = get_jwt_identity()
        if not UsuarioTienda.query.filter_by(
            usuario_email=email, 
            tienda_id=tienda_id
        ).first():
            return jsonify({"error": "No autorizado"}), 403

        # Parámetros de filtrado
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        tipo = request.args.get('tipo')  # ingreso, egreso
        concepto = request.args.get('concepto')  # venta, compra, etc

        # Consulta base
        query = MovimientoCaja.query.join(
            Caja
        ).filter(Caja.tienda_id == tienda_id)

        # Aplicar filtros
        if fecha_inicio and fecha_fin:
            query = query.filter(MovimientoCaja.fecha.between(fecha_inicio, fecha_fin))
        if tipo:
            query = query.filter(MovimientoCaja.tipo == tipo)
        if concepto:
            query = query.filter(MovimientoCaja.concepto == concepto)

        movimientos = query.order_by(MovimientoCaja.fecha.desc()).all()

        return jsonify({
            "movimientos": [{
                "id": m.id,
                "fecha": m.fecha.strftime('%Y-%m-%d %H:%M:%S'),
                "tipo": m.tipo,
                "concepto": m.concepto,
                "monto": float(m.monto),
                "usuario": m.usuario.nombre,
                "caja": m.caja.serialize(),
                "observacion": m.observacion
            } for m in movimientos]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/crear_registros', methods=['POST'])
def ruta_crear_registros():
    try:
        with current_app.app_context():
            crear_registros()
        return jsonify({"message": "Registros creados exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@api.route('/crear_operaciones', methods=['POST'])
def ruta_crear_operaciones():
	try:
		with current_app.app_context():
			crear_operaciones()
		return jsonify({"message": "Registros eliminados exitosamente"}), 200
	except Exception as e:
		return jsonify({"error": str(e)}), 500

@api.route('/eliminar_registros', methods=['POST'])
def ruta_eliminar_registros():
	try:
		with current_app.app_context():
			borrar_bd()
		return jsonify({"message": "Registros eliminados exitosamente"}), 200
	except Exception as e:
		return jsonify({"error": str(e)}), 500

