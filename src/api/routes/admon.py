from flask import request, jsonify, Blueprint
from api.models import db, Usuarios, UsuarioTienda
from api.utils import contraseñaAleatoria
from api.decoradores import admin_required

admon = Blueprint('admon', __name__)

@admon.route('/usuario/nuevo', methods=['POST'])
@admin_required
def nuevoVendedor():
    try:
        request_body = request.get_json()
        if request_body is None:
            return jsonify("You need to specify the request body as a json object", status_code=400)
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
            rol="vendedor"
        )
        db.session.add(relacion)
        db.session.commit()
        return jsonify(usuario.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
