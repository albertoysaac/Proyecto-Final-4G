from datetime import datetime, timedelta
import os
import openfoodfacts
from functools import wraps
from flask import Flask, request, jsonify, Blueprint
from dotenv import load_dotenv
from api.models import db, Usuarios, Tienda, Producto, Categoria, Inventario, Ticket, DetalleTicket
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from flask_jwt_extended import create_access_token
from flask_jwt_extended import JWTManager

load_dotenv()
api = Blueprint('api', __name__)
lector = openfoodfacts.API(user_agent="TiendaCRM/1.0")
CORS(api)

def creator_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = Usuarios.query.get(user_id)
        if user and user.rol == 'ceo':
            return fn(*args, **kwargs)
        else:
            return jsonify({"msg": "No cuentas con los permisos, contacta a tu CEO"}), 403
    return wrapper

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = Usuarios.query.get(user_id)
        if user and user.rol == 'admin' or user.rol == 'ceo':
            return fn(*args, **kwargs)
        else:
            return jsonify({"msg": "No cuentas con los permisos, contacta a tu supervisor"}), 403
    return wrapper

def vendedor_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = Usuarios.query.get(user_id)
        if user and user.rol == 'vendedor':
            return fn(*args, **kwargs)
        else:
            return jsonify({"msg": "No cuentas con los permisos, contacta a tu supervisor"}), 403
    return wrapper


def adminIDG():
    lastid = Usuarios.query.filter_by(rol="creador").order_by(Usuarios.id.desc()).first()
    if lastid is None:
        return 0
    else:
        return lastid.id + 11

def vendedorIDG(admin_id, tienda_id, rol):
    ultimo_usuario = Usuarios.query.filter_by(rol=rol).where(Usuarios.tienda_id == tienda_id).order_by(Usuarios.id.desc()).first()
    print("last_vendedor", ultimo_usuario)
    if ultimo_usuario is None and rol == "admin":
        primer_admin = admin_id + 1
        return primer_admin
    elif ultimo_usuario is None and rol == "vendedor":
        primer_vendedor = admin_id + 4
        return primer_vendedor
    elif ultimo_usuario.id > admin_id and ultimo_usuario.id < admin_id + 4 and rol == "admin":
        new_id = ultimo_usuario.id + 1
        return new_id
    elif ultimo_usuario.id > admin_id + 4 and ultimo_usuario.id < admin_id + 10 and rol == "vendedor":
        new_id = ultimo_usuario.id + 1
        return new_id
    else:
        return None
    

#rutas para usuarios 

@api.route('/usuario/nuevo/ceo', methods=['POST'], endpoint='nuevo_ceo')
def nuevoCEO():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("Faltan completar campos", status_code=400)
    tienda_id = request_body.get("tienda_id")
    if tienda_id:
        
        usuario = Usuarios(id=adminIDG(), nombre=request_body["nombre"],
                            apellido=request_body["apellido"], email=request_body["email"],
                            contraseña=request_body["contraseña"], rol="ceo", is_active=True,
                            fecha_contratacion=request_body["fecha_contratacion"], tienda_id=tienda_id,
                            hora_entrada=request_body["hora_entrada"], hora_salida=request_body["hora_salida"])                                                                                                                  
        db.session.add(usuario)
        db.session.commit()
        if usuario is None:
            return jsonify("Error al crear usuario", status_code=500)
        else:  
            expires = timedelta(hours=1)
            token = create_access_token(identity=usuario.id, expires_delta=expires)
        return jsonify(token), 201
    else:
        return jsonify("Error, el usuario no pertenece a ninguna tienda", status_code=400)

@api.route('/usuario/nuevo/Admin', methods=['POST'], endpoint='nuevo_Admin')
@creator_required
def nuevoAdmin():
    request_body = request.get_json()
    creador = Usuarios.query.get(get_jwt_identity())
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    usuario = Usuarios(id=vendedorIDG(get_jwt_identity() ,request_body["tienda_id"], "admin")
                        ,nombre=request_body["nombre"], apellido=request_body["apellido"],
                        email=request_body["email"], contraseña=contraseñaAleatoria(), rol="admin",
                        tienda_id=creador.tienda_id, is_active=True, fecha_contratacion=datetime.now(),
                        hora_entrada=request_body["hora_entrada"], hora_salida=request_body["hora_salida"])
    db.session.add(usuario)
    db.session.commit()
    return jsonify(usuario.serialize()), 201

@api.route('/usuario/nuevo/vendedor', methods=['POST'], endpoint='nuevo_vendedor')
@admin_required
def nuevoVendedor():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    usuario = Usuarios(id=vendedorIDG(get_jwt_identity() ,request_body["tienda_id"], "vendedor")
                        ,nombre=request_body["nombre"], apellido=request_body["apellido"],
                        email=request_body["email"], contraseña=contraseñaAleatoria(), rol="vendedor",
                        tienda_id=request_body["tienda_id"], is_active=True, fecha_contratacion=datetime.now(),
                        hora_entrada=request_body["hora_entrada"], hora_salida=request_body["hora_salida"])
    db.session.add(usuario)
    db.session.commit()
    return jsonify(usuario.serialize()), 201

def contraseñaAleatoria():
    import random
    import string
    longitud = 8
    valores = string.ascii_letters + string.digits
    contraseña = ''.join([random.choice(valores) for i in range(longitud)])
    return contraseña


@api.route('usuario/actDtos/Ceo', methods=['PUT'], endpoint='actualizar_datos_admin')
@jwt_required
def actualizarDatosAdmin():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("Error: Solicitud incompleta o vacia", status_code=400)
    if request_body["id"] != get_jwt_identity():
        return jsonify("No tienes la autoridad de modificar los datos personales", status_code=401)
    usuario = Usuarios.query.get(request_body["id"])
    if usuario is None:
        return jsonify("No se encontro el usuario", status_code=404)
    else:
        for key, value in request_body.items():
            if key != 'id' and key!= "horaio" and hasattr(usuario, key):
                setattr(usuario, key, value)
    db.session.commit()
    return jsonify(usuario.serialize()), 200

@api.route('/usuario/actDatosV', methods=['PUT'], endpoint='actualizar_datos_vendedor')
@vendedor_required
def actualizarDatosVendedor():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    if request_body["id"] != get_jwt_identity():
        return jsonify("You can only update your own information", status_code=401)
    usuario = Usuarios.query.get(request_body["id"])
    if usuario is None:
        return jsonify("User not found", status_code=404)
    usuario.name = request_body["nombre"]
    usuario.contraseña = request_body["contraseña"]
    db.session.commit()
    return jsonify(usuario.serialize()), 200

@api.route('/usuario/eliminar/<float:vendedor_id>', methods=['PUT'], endpoint='eliminar_usuario')
def eliminarUsuario(vendedor_id):
    usuario = Usuarios.query.get(vendedor_id)
    if usuario is None:
        return jsonify("User not found", status_code=404)
    usuario.is_active = False
    db.session.commit()
    return jsonify("User deleted successfully"), 200

@api.route('/usuario/activar/<float:vendedor_id>', methods=['PUT'], endpoint='activar_usuario')
def activarUsuario(vendedor_id):
    usuario = Usuarios.query.get(vendedor_id)
    if usuario is None:
        return jsonify("User not found", status_code=404)
    usuario.is_active = True
    db.session.commit()
    return jsonify("User activated successfully"), 200

@api.route('/usuario/misColaboradores', methods=['GET'], endpoint='mis_vendedores')
@jwt_required
def misVendedores():
    usuario = Usuarios.query.get(id=get_jwt_identity())
    if usuario:
        colaboradores = Usuarios.query.filter_by(tienda_id=usuario.tienda_id)
        return jsonify(colaboradores), 200
    else:
        return jsonify("No tienes una tienda asignada, contacta con tu administrador"), 404

@api.route('/tienda/<int:tienda_id>' , methods=['GET'], endpoint='inicio')
@jwt_required
def inicio(tienda_id):
    tienda = Tienda.query.get(tienda_id)
    return jsonify(tienda.serialize()), 200

def inicializarTienda(tienda_id):
    productos = Producto.query.all()
    for producto in productos:
        inventario = Inventario(tienda_id=tienda_id, producto_id=producto.id, cantidad=0)
        db.session.add(inventario)
    db.session.commit()

#paso 1 crear una tienda
@api.route('/crearTienda', methods=['POST'], endpoint='nueva_tienda')
def nuevaTienda():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    tienda = Tienda(nombre=request_body["nombre" ], direccion=request_body["direccion"], 
                    hora_apertura=request_body["hora_apertura"], hora_cierre=request_body["hora_cierre"])
    db.session.add(tienda)
    db.session.commit()
    inicializarTienda(tienda.id)
    return jsonify(tienda.serialize()), 201


#paso 5 consultar un producto por codigo de barras
@api.route('/productoCB', methods=['PUT'], endpoint='consultar_producto')
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

#paso 6 agregar un producto a la tienda
@api.route('/producto', methods=['POST'], endpoint='agregar_producto')
@jwt_required
def agregarProducto():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    producto = Producto(nombre=request_body["nombre"], descripcion=request_body["descripcion"], categoria=request_body["categoria"], marca=request_body["marca"], precio=request_body["precio"], codigoBarras=request_body["codigoBarras"])
    db.session.add(producto)
    db.session.commit()
    inventario = Inventario(tienda=request_body["tienda"], producto=producto.id, cantidad=request_body["cantidad"])
    db.session.add(inventario)
    db.session.commit()
    return jsonify(inventario.serialize()), 201


@api.route('/inventario', methods=['GET'], endpoint='inventario_tienda')
@jwt_required
def inventario_tienda():
    usuario = Usuarios.query.get(id = get_jwt_identity())
    if usuario.tienda_id:
        inventario = Inventario.query.filter_by(tienda_id = usuario.tienda_id)
        return jsonify(inventario.serialize(), 200)
    else:
        return jsonify("No tienes una tienda asignada, contacta con tu administrador"), 404

@api.route('/inventario/agregar', methods=['POST'], endpoint='agregar_inventario')
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

@api.route('/inventario/editar/<int:inventario_id>', methods=['PUT'], endpoint='editar_inventario')
def editar_inventario(inventario_id):
    data = request.json
    stock = Inventario.query.get(inventario_id)
    stock.cantidad = data['cantidad']
    stock.producto_id = data['producto_id']
    db.session.commit()
    return jsonify(stock.serialize()), 200



@api.route('/login', methods=['POST'], endpoint='login')
def login():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    usuario = Usuarios.query.filter_by(email=request_body["email"], contraseña=request_body["contraseña"]).first()
    if usuario is None:
        return jsonify("Invalid email or contraseña", status_code=401)
    access_token = create_access_token(identity=usuario.id)
    return jsonify(access_token=access_token), 200

@api.route('/tiendas', methods=['GET'], endpoint='get_tiendas')
@jwt_required()
def get_tiendas():
    tiendas = Tienda.query.all()
    tiendas = list(map(lambda tienda: tienda.serialize(), tiendas))
    return jsonify(tiendas), 200

@api.route('/users/<int:user_id>', methods=['GET'], endpoint='get_user')
def get_user(user_id):
    usuario = Usuarios.query.get(user_id)
    if usuario is None:
        return jsonify("User not found", status_code=404)
    return jsonify(usuario.serialize()), 200

@api.route('/users', methods=['POST'], endpoint='create_user')
def create_user():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    if "email" not in request_body:
        return jsonify("You need to specify the email", status_code=400)
    if "contraseña" not in request_body:
        return jsonify("You need to specify the contraseña", status_code=400)
    if "rol" not in request_body:
        return jsonify("You need to specify the rol", status_code=400)
    if "is_active" not in request_body:
        return jsonify("You need to specify the is_active", status_code=400)
    usuario = Usuarios(email=request_body["email"], contraseña=request_body["contraseña"], rol=request_body["rol"], is_active=request_body["is_active"])
    db.session.add(usuario)
    db.session.commit()
    return jsonify(usuario.serialize()), 201