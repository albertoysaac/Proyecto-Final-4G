from datetime import datetime, timedelta
from sqlalchemy import desc
import os
import openfoodfacts
from flask import Flask, request, jsonify, Blueprint
from dotenv import load_dotenv
from api.models import db, Usuarios, Tienda, Producto, Categoria, Inventario, Ticket, DetalleTicket, AdminTiendas, Horario
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from flask_jwt_extended import create_access_token
from flask_jwt_extended import JWTManager
from functools import wraps

load_dotenv()
api = Blueprint('api', __name__)
lector = openfoodfacts.API(user_agent="TiendaCRM/1.0")
CORS(api)

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        current_user = Usuarios.query.get(current_user_id)
        if current_user.rol != "admin":
            return jsonify("You need to be an admin to access this endpoint", status_code=401)
        return fn(*args, **kwargs)
    return wrapper

def vendor_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        current_user = Usuarios.query.get(current_user_id)
        if not current_user.rol:
            return jsonify("You need to be a vendor to access this endpoint", status_code=401)
        return fn(*args, **kwargs)
    return wrapper

#rutas para usuarios
def adminIDG():
    lastid = Usuarios.query.filter_by(rol="admin").order_by(Usuarios.id.desc()).first()
    if lastid is None:
        return 0
    else:
        return lastid.id + 11

def vendedorIDG(admin_id, tienda_id):
    print(admin_id)
    print(tienda_id)
    last_vendedor = Usuarios.query.filter_by(rol="vendedor").where(Usuarios.tienda_id == tienda_id).order_by(Usuarios.id.desc()).first()
    print(last_vendedor)
    if last_vendedor>admin_id and last_vendedor <= admin_id+9:
        new_id = last_vendedor.id + 1
        return new_id
    elif last_vendedor>admin_id+9:
        return jsonify("No se pueden agregar mas vendedores a esta tienda"), 400
    else:
        primer_vendedor =  admin_id + 1
        return primer_vendedor


@api.route('/usuario/nvo_administrador', methods=['POST'])
def nuevoAdministrador():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    tienda_id = request_body.get("tienda_id")
    if not tienda_id:
        usuario = Usuarios(id=adminIDG(), nombre=request_body["nombre"],
                            apellido=request_body["apellido"], email=request_body["email"],
                            contraseña=request_body["contraseña"], rol="admin", is_active=True,
                            fecha_contratacion=datetime.now())
        expires = timedelta(hours=1)
        token = create_access_token(identity=usuario.id, expires_delta=expires)
        if token:
            db.session.add(usuario)
            db.session.commit()
        else:
            return jsonify("Error al crear usuario", status_code=400)
        return jsonify(token), 201
    else:
        usuario = Usuarios(id=adminIDG(), nombre=request_body["nombre"],
                            apellido=request_body["apellido"], email=request_body["email"],
                            contraseña=request_body["contraseña"], tienda_id = request_body["tienda_id"],
                            rol="admin", is_active=True)
        db.session.add(usuario)
        db.session.commit()
        expires = datetime.timedelta(hours=1)
        token = create_access_token(identity=usuario.id, expires_delta=expires)
        return jsonify(token), 201

@api.route('/usuario/nvo_vendedor', methods=['POST'])
@admin_required
def nuevoVendedor():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    usuario = Usuarios(id=vendedorIDG(get_jwt_identity() ,request_body["tienda_id"])
                        ,nombre=request_body["nombre"], apellido=request_body["apellido"],
                        email=request_body["email"], contraseña=contraseñaAleatoria(), rol="vendedor",
                        tienda_id=request_body["tienda_id"], is_active=True, fecha_contratacion=datetime.now())
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

@api.route('/usuario/<float:vndr_id>/horarios', methods=['GET'])
@admin_required
def asignarHorarios(vndr_id):
    data = request.json
    nuevo_horario = Horario(
        usuario_id=vndr_id,
        dia_semana=data['dia_semana'],
        hora_inicio=datetime.strptime(data['hora_inicio'], '%H:%M').time(),
        hora_fin=datetime.strptime(data['hora_fin'], '%H:%M').time()
    )
    db.session.add(nuevo_horario)
    db.session.commit()
    return jsonify(nuevo_horario.serialize()), 201

@api.route('/usuario/actDatosA', methods=['PUT'])
@admin_required
def actualizarDatosAdmin():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    if request_body["id"] != get_jwt_identity():
        return jsonify("You can only update your own information", status_code=401)
    usuario = Usuarios.query.get(request_body["id"])
    if usuario is None:
        return jsonify("User not found", status_code=404)
    for key, value in request_body.items():
        if key != 'id' and hasattr(usuario, key):
            setattr(usuario, key, value)
    db.session.commit()
    return jsonify(usuario.serialize()), 200

@api.route('/usuario/actDatosV', methods=['PUT'])
@vendor_required
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

@api.route('/usuario/eliminar/<float:vendedor_id>', methods=['PUT'])
@admin_required
def eliminarUsuario(vendedor_id):
    usuario = Usuarios.query.get(vendedor_id)
    if usuario is None:
        return jsonify("User not found", status_code=404)
    usuario.is_active = False
    db.session.commit()
    return jsonify("User deleted successfully"), 200

@api.route('/usuario/activar/<float:vendedor_id>', methods=['PUT'])
@admin_required
def activarUsuario(vendedor_id):
    usuario = Usuarios.query.get(vendedor_id)
    if usuario is None:
        return jsonify("User not found", status_code=404)
    usuario.is_active = True
    db.session.commit()
    return jsonify("User activated successfully"), 200

@api.route('/usuario/misColaboradores', methods=['GET'])
@admin_required
def misVendedores():
    vendedores = Usuarios.query.filter(Usuarios.id.between(get_jwt_identity(), get_jwt_identity() + 1)).all()
    vendedores = list(map(lambda vendedor: vendedor.serialize(), vendedores))
    return jsonify(vendedores), 200

@api.route('/tienda/<int:tienda_id>' , methods=['GET'])
@jwt_required
def inicio(tienda_id):
    tienda = Tienda.query.get(tienda_id)
    return jsonify(tienda.serialize()), 200

#paso 2 crear una tienda
@api.route('/crearTienda', methods=['POST'])
@admin_required
def nuevaTienda():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    tienda = Tienda(nombre=request_body["nombre"], direccion=request_body["direccion"])
    db.session.add(tienda)
    db.session.commit()
    adminTienda = AdminTiendas(admin_id=get_jwt_identity(), tienda_id=tienda.id)
    db.session.add(adminTienda)
    db.session.commit()
    print(adminTienda)
    return jsonify(tienda.serialize()), 201

# paso 3 asignar un admin a una tienda
# @api.route('/tiendasadmin/<int:user_id>', methods=['POST'])
# def asignarAdmin(user_id):
#     request_body = request.get_json()
#     if request_body is None:
#         return jsonify({"message": "You need to specify the request body as a json object"}), 400
#     admin = Usuarios.query.get(user_id)
#     if admin is None:
#         return jsonify({"message": "User not found"}), 404
#     tienda = Tienda.query.get(request_body["tienda_id"])
#     if tienda is None:
#         return jsonify({"message": "Tienda not found"}), 404
#     adminTienda = AdminTiendas(admin_id=admin.id, tienda_id=tienda.id)
#     db.session.add(adminTienda)
#     db.session.commit()
#     return jsonify({"message": "Admin assigned to tienda successfully"}), 201


#paso 5 consultar un producto por codigo de barras
@api.route('/productoCB', methods=['PUT'])
def consultarProducto():
    request_body = request.get_json()
    if request_body is None:
        return jsonify("You need to specify the request body as a json object", status_code=400)
    codigoBarras = request_body["codigoBarras"]
    print(codigoBarras)
    producto = lector.product.get(codigoBarras ) #,fields=["code", "product_name"]
    print(producto)
    return jsonify(producto), 200

#paso 6 agregar un producto a la tienda
@api.route('/producto', methods=['POST'])
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

#todo: retornar uno 
@api.route('/inventario', methods=['GET'])
@jwt_required
def inventario_tienda():
    usuario = Usuarios.query.get(get_jwt_identity)
    if usuario.tienda_id:
        inventario = Inventario.query.filter_by(tienda_id = usuario.tienda_id)
        return jsonify(inventario.serialize(), 200)
    else:
        tiendas_id = AdminTiendas.tienda_id.query.filter_by(admin_id = usuario.id).all()
        inventarios = []
        for id in tiendas_id:
            inventarios.append(Inventario.query.filter_by(tienda_id = id))
        return inventario.serialize()

@api.route('/inventario/agregar', methods=['POST'])
@vendor_required
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
    access_token = create_access_token(identity=usuario.id)
    return jsonify(access_token=access_token), 200

@api.route('/tiendas', methods=['GET'])
@jwt_required()
def get_tiendas():
    tiendas = Tienda.query.all()
    tiendas = list(map(lambda tienda: tienda.serialize(), tiendas))
    return jsonify(tiendas), 200

@api.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    usuario = Usuarios.query.get(user_id)
    if usuario is None:
        return jsonify("User not found", status_code=404)
    return jsonify(usuario.serialize()), 200

@api.route('/users', methods=['POST'])
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