  
import os
from flask_admin import Admin
from .models import db, Usuarios,Tienda,Producto, Inventario, UsuarioTienda, Venta, DetalleVenta, Compra, DetalleCompra, Caja, MovimientoCaja, MovimientoInventario, MovimientoInventario, MovimientoCaja, HistorialPrecio, PagoVenta, PagoCompra
from flask_admin.contrib.sqla import ModelView

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')

    
    # Add your models here, for example this is how we add a the User model to the admin
    admin.add_view(ModelView(Usuarios, db.session))
    admin.add_view(ModelView(Tienda, db.session))
    admin.add_view(ModelView(UsuarioTienda, db.session))
    admin.add_view(ModelView(Producto, db.session))
    admin.add_view(ModelView(Inventario, db.session))
    admin.add_view(ModelView(HistorialPrecio, db.session))
    admin.add_view(ModelView(Caja, db.session))
    admin.add_view(ModelView(MovimientoCaja, db.session))
    admin.add_view(ModelView(Compra, db.session))
    admin.add_view(ModelView(DetalleCompra, db.session))
    admin.add_view(ModelView(Venta, db.session))
    admin.add_view(ModelView(DetalleVenta, db.session))
    admin.add_view(ModelView(PagoVenta, db.session))
    admin.add_view(ModelView(PagoCompra, db.session))
    admin.add_view(ModelView(MovimientoInventario, db.session))
    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))