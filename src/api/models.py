from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

class UsuarioTienda(db.Model):
    usuario_email = db.Column(db.String(120), db.ForeignKey('usuarios.email'), primary_key=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), primary_key=True)
    rol = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))
    usuario = db.relationship('Usuarios', backref='tienda_roles')
    tienda = db.relationship('Tienda', backref='usuario_roles')
    
    
class Tienda(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(120), nullable=False)
    direccion = db.Column(db.String(120), nullable=False)
    hora_apertura = db.Column(db.Time, nullable=False)
    hora_cierre = db.Column(db.Time, nullable=False)
    inventario = db.relationship('Inventario', backref='tienda')
    finanzas = db.relationship('Ticket', backref='tienda')
    
    def serialize(self):            
        return {
            "id": self.id,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "ceo": [{"nombre": u.usuario.nombre, 
                    "email": u.usuario.email} 
                   for u in self.usuario_roles if u.rol == 'ceo'],
            "administradores": [{"nombre": u.usuario.nombre, 
                               "email": u.usuario.email} 
                              for u in self.usuario_roles if u.rol == 'admin'],
            "vendedores": [{"nombre": u.usuario.nombre, 
                          "email": u.usuario.email} 
                         for u in self.usuario_roles if u.rol == 'vendedor'],
            "inventario": [producto.serialize() for producto in self.inventario]
        }


class Usuarios(db.Model):
    email = db.Column(db.String(120), unique=True, primary_key=True, nullable=False)
    contraseña = db.Column(db.String(80), nullable=False)
    nombre = db.Column(db.String(120), nullable=False)
    apellido = db.Column(db.String(120), nullable=False)    
    is_active = db.Column(db.Boolean(), nullable=False)
    fecha_contratacion = db.Column(db.Date, nullable=False)
    hora_entrada = db.Column(db.Time, nullable=False)
    hora_salida = db.Column(db.Time, nullable=False)
    
    
    def __repr__(self):
        return f'<Usuarios {self.email}>'

    def serialize(self):
        return {
            "nombre": self.nombre,  
            "apellido": self.apellido,  
            "email": self.email,
            "contraseña": self.contraseña,
            "fecha_contratacion": self.fecha_contratacion.strftime('%Y-%m-%d'),
            "hora_entrada": self.hora_entrada.strftime('%H:%M:%S'), 
            "hora_salida": self.hora_salida.strftime('%H:%M:%S'),
            "autoridades": [{
                "tienda": {"id": rel.tienda.id, 
                          "nombre": rel.tienda.nombre},
                "rol": rel.rol
            } for rel in self.tienda_roles]
        }
        
    
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(120), nullable=False)
    categoria = db.Column(db.String(80), nullable=False)
    marca = db.Column(db.String(120), nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    codigoBarras = db.Column(db.String(120), nullable=False)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False) # debo borrar esta columna
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))
    
    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "categoria": self.categoria,
            "marca": self.marca,
            "precio": self.precio,
            "codigoBarras": self.codigoBarras,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    
class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    vendedor_id = db.Column(db.String(120), db.ForeignKey('usuarios.email'), nullable=False)
    estado = db.Column(db.String(20), default='completado')  # completado/cancelado
    metodo_pago = db.Column(db.String(50))
    subtotal = db.Column(db.Float, nullable=False)
    impuestos = db.Column(db.Float, default=0.0)                                
    descuento = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, nullable=False)
    productos = db.Column(db.JSON, nullable=False)  # Array de objetos con producto_id, cantidad, precio
    
    def serialize(self):
        return {
            "id": self.id,
            "fecha": self.fecha,
            "tienda_id": self.tienda_id,
            "vendedor": self.vendedor.nombre,
            "tipo": self.tipo,
            "estado": self.estado,
            "metodo_pago": self.metodo_pago,
            "subtotal": self.subtotal,
            "impuestos": self.impuestos,
            "descuento": self.descuento,
            "total": self.total,
            "productos": self.productos
        }

    @property
    def productos_detalle(self):
        return [
            {
                "producto": Producto.query.get(item["producto_id"]).serialize(),
                "cantidad": item["cantidad"],
                "precio": item["precio"]
            } 
            for item in self.productos
        ]
            
class Inventario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    cantidad = db.Column(db.Integer, default=0)
    cantidad_minima = db.Column(db.Integer, default=5)  # Para alertas de stock
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))
    
    # Relaciones
    producto = db.relationship('Producto', backref='inventario')
    
    __table_args__ = (
        db.UniqueConstraint('tienda_id', 'producto_id', name='uix_tienda_producto'),
    )
    
    def serialize(self):
        return {
            "id": self.id,
            "tienda_id": self.tienda_id,
            "producto": self.producto.serialize(),
            "cantidad": self.cantidad,
            "cantidad_minima": self.cantidad_minima,
            "ubicacion": self.ubicacion,
            "necesita_reposicion": self.cantidad <= self.cantidad_minima,
            "updated_at": self.updated_at
        }
