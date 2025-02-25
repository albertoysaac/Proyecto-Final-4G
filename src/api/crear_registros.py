from flask import Flask
from api.models import db, Usuarios, Tienda, UsuarioTienda, Producto, Inventario, HistorialPrecio
from datetime import datetime, timedelta
import random
import pdb

# Importar la aplicación Flask
from api import create_app

app = create_app()

def crear_registros():
    try:
        # Crear usuarios CEO
        ceos = [
            Usuarios(email=f"ceo{i}@test.com", nombre=f"CEO {i}", apellido="Test", is_active=True, fecha_contratacion=datetime.now(), hora_entrada=datetime.strptime("08:00", '%H:%M').time(), hora_salida=datetime.strptime("17:00", '%H:%M').time())
            for i in range(1, 4)
        ]
        for ceo in ceos:
            ceo.set_password("password")
        db.session.add_all(ceos)
        db.session.flush()
        print("CEOs creados y agregados a la sesión.")

        # Crear tiendas y asignar a CEOs
        tiendas = []
        tiendas_por_ceo = [1, 2, 3]
        for i, num_tiendas in enumerate(tiendas_por_ceo, start=1):
            for j in range(1, num_tiendas + 1):
                tienda = Tienda(nombre=f"Tienda {i}-{j}", direccion=f"Dirección {i}-{j}", hora_apertura=datetime.strptime("08:00", '%H:%M').time(), hora_cierre=datetime.strptime("20:00", '%H:%M').time())
                db.session.add(tienda)
                db.session.flush()
                tiendas.append(tienda)
                rel_ceo = UsuarioTienda(usuario_email=ceos[i-1].email, tienda_id=tienda.id, rol='ceo')
                db.session.add(rel_ceo)
        print("Tiendas creadas y asignadas a CEOs.")

        # Crear administradores y vendedores
        for tienda in tiendas:
            num_admins = random.randint(1, 2)
            num_vendedores = random.randint(1, 3)
            admins = [
                Usuarios(email=f"admin{tienda.id}-{k}@test.com", nombre=f"Admin {tienda.id}-{k}", apellido="Test", is_active=True, fecha_contratacion=datetime.now(), hora_entrada=datetime.strptime("08:00", '%H:%M').time(), hora_salida=datetime.strptime("17:00", '%H:%M').time())
                for k in range(1, num_admins + 1)
            ]
            for admin in admins:
                admin.set_password("password")
                db.session.add(admin)
                db.session.flush()
                rel_admin = UsuarioTienda(usuario_email=admin.email, tienda_id=tienda.id, rol='admin')
                db.session.add(rel_admin)

            vendedores = [
                Usuarios(email=f"vendedor{tienda.id}-{l}@test.com", nombre=f"Vendedor {tienda.id}-{l}", apellido="Test", is_active=True, fecha_contratacion=datetime.now(), hora_entrada=datetime.strptime("08:00", '%H:%M').time(), hora_salida=datetime.strptime("17:00", '%H:%M').time())
                for l in range(1, num_vendedores + 1)
            ]
            for vendedor in vendedores:
                vendedor.set_password("password")
                db.session.add(vendedor)
                db.session.flush()
                rel_vendedor = UsuarioTienda(usuario_email=vendedor.email, tienda_id=tienda.id, rol='vendedor')
                db.session.add(rel_vendedor)
        print("Administradores y vendedores creados y asignados a tiendas.")

        # Crear productos
        productos = [
            Producto(codigo=f"PROD{i}", nombre=f"Producto {i}", descripcion=f"Descripción del producto {i}", categoria=f"Categoría {i}", marca=f"Marca {i}", unidad_medida=f"Unidad {i}")
            for i in range(1, 11)
        ]
        db.session.add_all(productos)
        db.session.flush()
        print("Productos creados y agregados a la sesión.")
        pdb.set_trace()  # Punto de interrupción para depuración

        # Crear inventarios
        inventarios = []
        for tienda in tiendas:
            for producto in productos:
                inventario = Inventario(tienda_id=tienda.id, producto_id=producto.id, cantidad=random.randint(50, 200), cantidad_minima=10, cantidad_maxima=300)
                inventarios.append(inventario)
        db.session.add_all(inventarios)
        db.session.flush()
        print("Inventarios creados y agregados a la sesión.") 

        # Crear historial de precios
        historial_precios = [
            HistorialPrecio(producto_id=productos[i % len(productos)].id, tienda_id=tiendas[i % len(tiendas)].id, precio_compra=random.uniform(10, 50), precio_venta=random.uniform(50, 100), fecha_inicio=datetime.now() - timedelta(days=random.randint(0, 30)))
            for i in range(1, 20)
        ]
        db.session.add_all(historial_precios)
        db.session.flush()
        print("Historial de precios creado y agregado a la sesión.")
        pdb.set_trace()  # Punto de interrupción para depuración

        db.session.commit()
        print("Transacciones confirmadas en la base de datos.")
    except Exception as e:
        db.session.rollback()
        print(f"Error al crear registros: {str(e)}")

if __name__ == "__main__":
    with app.app_context():
        crear_registros()