from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from .models import UsuarioTienda, db

def check_role(allowed_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            email = get_jwt_identity()
            
            roles = db.session.query(UsuarioTienda.rol).filter(
                UsuarioTienda.usuario_email == email
            ).all()
            
            user_roles = [role[0] for role in roles]
            
            if not any(role in allowed_roles for role in user_roles):
                return jsonify({"error": "No tienes permisos suficientes"}), 403
                
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# Decoradores específicos
def ceo_required(fn):
    return check_role(['ceo'])(fn)

def admin_required(fn):
    return check_role(['ceo', 'admin'])(fn)

def vendedor_required(fn):
    return check_role(['ceo', 'admin', 'vendedor'])(fn)