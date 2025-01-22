from flask import request, jsonify, Blueprint
from api.models import db, Usuarios, Tienda, UsuarioTienda
from api.utils import contraseñaAleatoria
from flask_jwt_extended import get_jwt_identity
from api.decoradores import ceo_required

ceo = Blueprint('ceo', __name__)

@ceo.route('/usuario/nuevo', methods=['POST'])
@ceo_required
def nuevoAdmin():
    try:
        request_body = request.get_json()
        if request_body is None:
            return jsonify("You need to specify the request body as a json object", status_code=400)
        # if request_body["rol"] == "ceo":
        #     return jsonify("No puedes crear un CEO"), 400
        usuario = Usuarios(
                    nombre=request_body["nombre"],
                    apellido=request_body["apellido"], 
                    email=request_body["email"],
                    contraseña=contraseñaAleatoria(), 
                    is_active=True,
                    fecha_contratacion=request_body["fecha_contratacion"], 
                    hora_entrada=request_body["hora_entrada"], 
                    hora_salida=request_body["hora_salida"]
                )   
        db.session.add(usuario)
        db.session.flush()
        relacion = UsuarioTienda(
            usuario_email=usuario.email,
            tienda_id=request_body["tienda_id"],
            rol= "vendedor" if request_body["rol"] == "ceo" else request_body["rol"] 
        )
        db.session.add(relacion)
        db.session.commit()
        return jsonify(usuario.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    
@ceo.route('/usuario/actDtosCeo', methods=['PUT'])
@ceo_required
def actualizarDatosAdmin(): 
    request_body = request.get_json()
    if request_body is None:
        return jsonify("Error: Solicitud incompleta o vacia", status_code=400)
    usuario = Usuarios.query.get(request_body["email"])
    try:
        for key, value in request_body.items():
            if key != 'email' and key!= "fecha_contratacion" and hasattr(usuario, key):
                setattr(usuario, key, value)
        db.session.commit()
        return jsonify(usuario.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ceo.route('/usuarioeliminar', methods=['PUT'])
@ceo_required
def eliminarUsuario():
    request_body = request.get_json()
    usuario = Usuarios.query.get(request_body["email"])
    if usuario is None:
        return jsonify("User not found", status_code=404)
    usuario.is_active = False
    db.session.commit()
    return jsonify("User deleted successfully"), 200

@ceo.route('/tiendas', methods=['GET'])
@ceo_required
def get_tiendas():
    try:
        # Obtener email del token
        email = get_jwt_identity()
        # Buscar usuario por email (get solo acepta primary key)
        usuario = Usuarios.query.filter_by(email=email).first()
        
        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
            
        # Obtener tiendas donde el usuario es CEO
        tiendas = Tienda.query.join(Usuarios).filter(
            Usuarios.email == email,
            Usuarios.rol == 'ceo'
        ).all()
        return jsonify({
            "tiendas": [tienda.serialize() for tienda in tiendas]
        }), 200
    except Exception as e:
        return jsonify({
            "error": f"Error al obtener tiendas: {str(e)}"
        }), 500

@ceo.route('/nuevaTienda', methods=['POST'])
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
        
        # Asociar CEO existente a nueva tienda
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