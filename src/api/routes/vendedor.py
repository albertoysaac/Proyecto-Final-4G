from flask import request, jsonify, Blueprint
from api.models import db, Usuarios
from flask_jwt_extended import get_jwt_identity
from api.decoradores import vendedor_required

vendedor = Blueprint('vendedor', __name__)

@vendedor.route('/usuario/actualizarDatos', methods=['PUT'])
@vendedor_required
def actualizarDatosVendedor():
    try:
        request_body = request.get_json()
        
        if request_body is None:
            return jsonify("You need to specify the request body as a json object", status_code=400)
        
        if request_body["email"] != get_jwt_identity():
            return jsonify("You can only update your own information", status_code=401)
        
        usuario = Usuarios.query.get(request_body["email"])
        if usuario is None:
            return jsonify("User not found", status_code=404)
        
        usuario.name = request_body["nombre"]
        usuario.apellido = request_body["apellido"]
        usuario.contraseña = request_body["contraseña"]
        
        db.session.commit()
        return jsonify(usuario.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
