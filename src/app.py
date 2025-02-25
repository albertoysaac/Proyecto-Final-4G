"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
import random
from datetime import timedelta, datetime
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db 
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from api.crear_registros import crear_registros
from api.crear_operaciones import crear_operaciones
from flask_cors import CORS
# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
os.environ['FLASK_APP'] = 'src/app.py'
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app, supports_credentials=True, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Range", "X-Content-Range"],
            "supports_credentials": True
        }
    })

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=False)
db.init_app(app)

# add the admin
setup_admin(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_KEY")  # Cambia esto por una clave segura
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=20)  # Token de acceso expira en 15 minutos
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')


# Handle/serialize errors like a JSON object
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response

def borrar_bd():
    """Borrar todas las tablas y sus datos en la base de datos."""
    db.drop_all()
    db.create_all()
    print("Base de datos borrada y recreada exitosamente.")

@app.cli.command("crear_registros")
def crear_registros_command():
    """Borrar la base de datos y crear registros iniciales."""
    with app.app_context():
        borrar_bd()
        crear_registros()
    print("Registros iniciales creados exitosamente.")

@app.cli.command("crear_operaciones")
def crear_operaciones_command():
    """Crear operaciones y movimientos en la base de datos."""
    with app.app_context():
        crear_operaciones()
    print("Operaciones y movimientos creados exitosamente.")

# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)