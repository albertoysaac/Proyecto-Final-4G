from flask import Flask
from api.models import db


def borrar_bd():
    """Borrar todas las tablas y sus datos en la base de datos."""
    db.drop_all()
    db.create_all()
    print("Base de datos borrada y recreada exitosamente.")