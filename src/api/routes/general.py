import openfoodfacts
from flask import request, jsonify, Blueprint
from api.models import db, Usuarios, Tienda, Producto, Inventario, UsuarioTienda
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.decoradores import vendedor_required
from flask_jwt_extended import get_jwt_identity, create_access_token

api = Blueprint('api', __name__)
lector = openfoodfacts.API(user_agent="TiendaCRM/1.0")
CORS(api)


@api.route('/registroInicial', methods=['POST'])
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
            contraseña=request_body["usuario"]["contraseña"],
            fecha_contratacion=request_body["usuario"]["fecha_contratacion"],
            hora_entrada=request_body["usuario"]["hora_entrada"],
            hora_salida=request_body["usuario"]["hora_salida"],
            is_active=True
        )
        db.session.add(nuevo_ceo)
        db.session.flush()

        rel_ceo_tienda = UsuarioTienda(
            usuario_email=nuevo_ceo.email,
            tienda_id=nueva_tienda.id,
            rol='ceo'
        )
        db.session.add(rel_ceo_tienda)
        db.session.commit()

        token = create_access_token(identity=nuevo_ceo.email)
        return jsonify({
            "message": "Registro exitoso",
            "token": token,
            "tienda": nueva_tienda.serialize(),
            "usuario": nuevo_ceo.serialize()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/misColaboradores/<int:tienda_id>', methods=['GET'])
@vendedor_required
def misVendedores(tienda_id):
    try:
        email = get_jwt_identity()
        if UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
            colaboradores = Usuarios.query.join(UsuarioTienda).filter(UsuarioTienda.c.tienda_id == tienda_id).all()
            return jsonify([colaborador.serialize() for colaborador in colaboradores]), 200
        else:
            return jsonify("No perteneces a esta tienda"), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/productoCB', methods=['PUT'])
@vendedor_required
def consultarProducto():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    codigoBarras = request_body["codigoBarras"]
    print(codigoBarras)
    consulta = lector.product.get(codigoBarras, fields=["code", "brands", "product_name", "product_quantity", "product_quantity_unit", "ingredients_text", "categories_tags"])
    if consulta is None:
        return jsonify("Product not found", status_code=404)
    return jsonify(consulta), 200

@api.route('/producto', methods=['POST'])
@vendedor_required
def agregarProducto():
    try:
        data = request.get_json()
        email = get_jwt_identity()
        rel_usuario_tienda = UsuarioTienda.query.filter_by(
            usuario_email=email
        ).first()
        
        
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

@api.route('/inventario/<int:tienda_id>', methods=['GET'])
@vendedor_required
def inventario_tienda(tienda_id):
    email = get_jwt_identity()
    if UsuarioTienda.query.filter_by(usuario_email=email, tienda_id=tienda_id).first():
        inventario = Inventario.query.filter_by(tienda_id=tienda_id).all()
        return jsonify([stock.serialize() for stock in inventario]), 200
    else:
        return jsonify("No perteneces a esta tienda"), 403

@api.route('/inventario/agregar', methods=['POST'])
@vendedor_required
def agregar_inventario():
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

@api.route('/inventario/editar/<int:inventario_id>', methods=['PUT'])
@vendedor_required
def editar_inventario(inventario_id):
    data = request.json
    stock = Inventario.query.get(inventario_id)
    stock.cantidad = data['cantidad']
    stock.producto_id = data['producto_id']
    db.session.commit()
    return jsonify(stock.serialize()), 200

@api.route('/login', methods=['POST'])
def login():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    usuario = Usuarios.query.filter_by(email=request_body["email"], contraseña=request_body["contraseña"]).first()
    if usuario is None:
        return jsonify("Invalid email or contraseña", status_code=401)
    access_token = create_access_token(identity=usuario.email)
    return jsonify(access_token=access_token, datos = usuario.serialize()), 200

@api.route('/user/<string:user_email>', methods=['GET'])
@vendedor_required
def get_user(user_email):
    usuario = Usuarios.query.get(user_email)
    if usuario is None:
        return jsonify("User not found", status_code=404)
    return jsonify(usuario.serialize()), 200