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
    AdminTiendas = db.relationship('AdminTiendas', backref='tienda', lazy=True)
    
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

class Usuarios(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    apellido = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    contraseña = db.Column(db.String(80), nullable=False)
    rol = db.Column(db.String(80), nullable=False)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'))
    is_active = db.Column(db.Boolean(), nullable=False)
    fecha_contratacion = db.Column(db.Date, nullable=False)
    horarios = db.relationship('Horario', backref='usuario', lazy=True)
    AdminTiendas = db.relationship('AdminTiendas', backref='usuario', lazy=True)
    
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
            "fecha_contratacion": self.fecha_contratacion,
            "horarios": [{"dia_semana": horario.dia_semana, "hora_inicio": horario.hora_inicio, "hora_fin": horario.hora_fin} for horario in self.horarios] if self.horarios else [],
        }
        
class Horario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    dia_semana = db.Column(db.Integer, nullable=False)  # 0-6 para lunes-domingo
    hora_inicio = db.Column(db.Time, nullable=False)
    hora_fin = db.Column(db.Time, nullable=False)
    
    def __repr__(self):
        return f'<Horario {self.dia_semana} {self.hora_inicio}-{self.hora_fin}>'
    
    def serialize(self):
        return {
            "id": self.id,
            "dia_semana": self.dia_semana,
            "hora_inicio": self.hora_inicio,
            "hora_fin": self.hora_fin
        }
class AdminTiendas(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'))
    
    def serialize(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "tienda_id": self.tienda_id
        }
    
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(120), nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'))
    marca = db.Column(db.String(120), nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    codigoBarras = db.Column(db.String(120), nullable=False)
    
    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "categoria": self.categoria.nombre,
            "marca": self.marca,
            "precio": self.precio,
            "codigoBarras": self.codigoBarras
        }
    
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
    
    def serialize(self):
        return {
            "inventario_id": self.inventario_id,
            "tienda_id": self.tienda_id,
            "nombre": self.producto.nombre,
            "descripcion": self.producto.descripcion,
            "marca": self.producto.marca,
            "precio": self.producto.precio,
            "codigoBarras": self.producto.codigoBarras,
            "cantidad": self.cantidad,
        }
    
class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, nullable=False)
    total = db.Column(db.Float, nullable=False)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'))
    vendedor_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    
    def serialize(self):
        return {
            "id": self.id,
            "fecha": self.fecha,
            "total": self.total,
            "tienda_id": self.tienda_id,
            "vendedor_id": self.vendedor_id
        }

class DetalleTicket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'))
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'))
    cantidad = db.Column(db.Integer, nullable=False)
    precio = db.Column(db.Float, nullable=False)
    ticket = db.relationship('Ticket', backref=db.backref('detalles', lazy=True))
    producto = db.relationship('Producto', backref=db.backref('detalles_ticket', lazy=True))
    compra_Venta = db.Column(db.Boolean, nullable=False)
    
    def serialize(self):
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "nombre_producto": self.producto.nombre,
            "descripcion": self.producto.descripcion,
            "cantidad": self.cantidad,
            "precio": self.precio,
            "usuario_id": self.ticket.vendedor.id,
            "usuario": self.ticket.vendedor.nombre,
            "fecha": self.ticket.fecha,
            "compra_Venta": self.compra_Venta,
            "total": self.ticket.total            
        }

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