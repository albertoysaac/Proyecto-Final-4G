from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()
class Tienda(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(120), nullable=False)
    direccion = db.Column(db.String(120), nullable=False)
    usuarios = db.relationship('Usuarios', backref='tienda')
    inventario = db.relationship('Inventario', backref='tienda')
    finanzas = db.relationship('Ticket', backref='tienda')
    
    def __repr__(self):
        return f'<Tienda {self.nombre}>'
    
    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "administradores": [usuario.serialize() for usuario in self.usuarios if usuario.role == "admin"],
            "vendedores": [usuario.serialize() for usuario in self.usuarios if usuario.role == "vendedor"],
            "inventario": [producto.serialize() for producto in self.inventario]
        }

class AdminTiendas(db.Model):
    id = db.Column(db.Integer, unique = True, nullable = True)
    admin_id = db.Column(db.Numeric, db.ForeignKey('usuarios.id'))
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'))

class Usuarios(db.Model):
    id = db.Column(db.Numeric(5, 2), primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    apellido = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    contraseña = db.Column(db.String(80), nullable=False)
    rol = db.Column(db.String(80), nullable=False)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'))
    is_active = db.Column(db.Boolean(), nullable=False)
    
    def __repr__(self):
        return f'<Usuarios {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,  
            "apellido": self.apellido,  
            "email": self.email,
            "rol": self.rol,  
            "tienda": self.tienda.nombre if self.tienda else None,  
        }
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(120), nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'))
    marca = db.Column(db.String(120), nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    codigoBarras = db.Column(db.String(120), nullable=False)
    
class Categoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    producto = db.relationship('Producto', backref='categoria')
    
    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre
        }

class Inventario(db.Model):
    inventario_id = db.Column(db.Integer, primary_key=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), unique=True) 
    cantidad = db.Column(db.Integer, nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    producto = db.relationship('Producto', backref=db.backref('inventario', lazy='dynamic'))
    
class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, nullable=False)
    total = db.Column(db.Float, nullable=False)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'))
    vendedor_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'))

class DetalleTicket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'))
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'))
    cantidad = db.Column(db.Integer, nullable=False)
    precio = db.Column(db.Float, nullable=False)
    ticket = db.relationship('Ticket', backref=db.backref('detalles', lazy=True))
    producto = db.relationship('Producto', backref=db.backref('detalles_ticket', lazy=True))

def ventas_por_dia(fecha):
    ventas = db.session.query(db.func.sum(Ticket.total)).filter(db.func.date(Ticket.fecha) == fecha).scalar()
    return ventas

# Ejemplo de función para obtener el producto más vendido
def producto_mas_vendido():
    resultado = db.session.query(
        DetalleTicket.producto_id, 
        db.func.sum(DetalleTicket.cantidad).label('total_vendido')
    ).group_by(DetalleTicket.producto_id).order_by(db.desc('total_vendido')).first()
    if resultado:  # Asegurarse de que hay un resultado
        producto_id, total_vendido = resultado
        return producto_id, total_vendido
    return None, 0