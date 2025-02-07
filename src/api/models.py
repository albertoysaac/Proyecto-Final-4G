from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
db = SQLAlchemy()

# Modelo UsuarioTienda (relación muchos a muchos entre usuarios y tiendas)
class UsuarioTienda(db.Model):
    usuario_email = db.Column(db.String(120), db.ForeignKey('usuarios.email'), primary_key=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), primary_key=True)
    rol = db.Column(db.String(20), nullable=False)  # ceo, admin, vendedor
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))
    usuario = db.relationship('Usuarios', backref='tienda_roles')
    tienda = db.relationship('Tienda', backref='usuario_roles')

# Modelo Tienda
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

# Modelo Usuarios
class Usuarios(db.Model):
    email = db.Column(db.String(120), unique=True, primary_key=True, nullable=False)
    contraseña = db.Column(db.String(255), nullable=False)  # Hashed password
    nombre = db.Column(db.String(120), nullable=False)
    apellido = db.Column(db.String(120), nullable=False)    
    is_active = db.Column(db.Boolean(), nullable=False)
    fecha_contratacion = db.Column(db.Date, nullable=False)
    hora_entrada = db.Column(db.Time, nullable=False)
    hora_salida = db.Column(db.Time, nullable=False)
    token_version = db.Column(db.Integer, default=1)  # Para invalidar tokens viejos
    last_logout_time = db.Column(db.DateTime, nullable=True)  # Para invalidar tokens tras cierre de sesión

    def set_password(self, password):
        if isinstance(password, str):
            password = str(password)
        self.contraseña = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        if isinstance(password, str):
            password = str(password)
        try:
            return check_password_hash(self.contraseña, password)
        except Exception as e:
            print(f"Error al verificar contraseña: {str(e)}")
            return False

    def __repr__(self):
        return f'<Usuarios {self.email}>'

    def serialize(self):
        return {
            "nombre": self.nombre,  
            "apellido": self.apellido,  
            "email": self.email,
            "fecha_contratacion": self.fecha_contratacion.strftime('%Y-%m-%d'),
            "hora_entrada": self.hora_entrada.strftime('%H:%M:%S'), 
            "hora_salida": self.hora_salida.strftime('%H:%M:%S'),
            "autoridades": [{
                "tienda": {"id": rel.tienda.id, 
                          "nombre": rel.tienda.nombre},
                "rol": rel.rol
            } for rel in self.tienda_roles]
        }

# Modelo Producto
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(120), nullable=False)
    categoria = db.Column(db.String(80), nullable=False)
    marca = db.Column(db.String(120), nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    codigoBarras = db.Column(db.String(120), nullable=False)
    fecha_caducidad = db.Column(db.Date, nullable=True)  # Para productos perecederos
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedor.id'), nullable=True)  # Clave foránea
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))

    proveedor = db.relationship('Proveedor', backref='productos')  # Relación con Proveedor

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "categoria": self.categoria,
            "marca": self.marca,
            "precio": float(self.precio),
            "codigoBarras": self.codigoBarras,
            "fecha_caducidad": self.fecha_caducidad.strftime('%Y-%m-%d') if self.fecha_caducidad else None,
            "proveedor": self.proveedor.serialize() if self.proveedor else None,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

# Modelo Cliente
class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    apellido = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)  # Opcional
    telefono = db.Column(db.String(20), nullable=True)  # Opcional
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    creado_por = db.Column(db.String(120), db.ForeignKey('usuarios.email'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))

    usuario = db.relationship('Usuarios', backref='clientes_creados')
    tienda = db.relationship('Tienda', backref='clientes')
    
    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "email": self.email,
            "telefono": self.telefono,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

# Modelo Proveedor
class Proveedor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    contacto = db.Column(db.String(120), nullable=True)  # Nombre del contacto
    telefono = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    direccion = db.Column(db.String(120), nullable=True)
    creado_por = db.Column(db.String(120), db.ForeignKey('usuarios.email'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))
    
    usuario = db.relationship('Usuarios', backref='proveedores_creados')
    tiendas = db.relationship('Tienda', secondary='proveedor_tienda', backref='proveedores')

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "contacto": self.contacto,
            "telefono": self.telefono,
            "email": self.email,
            "direccion": self.direccion,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        
# Modelo ProveedorTienda (relación muchos a muchos entre proveedores y tiendas)
class ProveedorTienda(db.Model):
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedor.id'), primary_key=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('proveedor_id', 'tienda_id', name='uix_proveedor_tienda'),
    )
    
# Modelo Inventario
class Inventario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    cantidad = db.Column(db.Integer, default=0)
    cantidad_minima = db.Column(db.Integer, default=5)  # Para alertas de stock
    ubicacion = db.Column(db.String(120), nullable=True)  # Ubicación física en la tienda
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))

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

# Modelo Ticket
class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    vendedor_id = db.Column(db.String(120), db.ForeignKey('usuarios.email'), nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=True)  # Clave foránea
    estado = db.Column(db.String(20), default='completado')  # completado/cancelado
    metodo_pago = db.Column(db.String(50))
    subtotal = db.Column(db.Float, nullable=False)
    impuestos = db.Column(db.Float, default=0.0)                                
    descuento = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, nullable=False)
    productos = db.Column(db.JSON, nullable=False)  # Array de objetos con producto_id, cantidad, precio

    cliente = db.relationship('Cliente', backref='tickets')  # Relación con Cliente

    def serialize(self):
        return {
            "id": self.id,
            "fecha": self.fecha,
            "tienda_id": self.tienda_id,
            "vendedor": self.vendedor.nombre,
            "cliente": self.cliente.serialize() if self.cliente else None,
            "estado": self.estado,
            "metodo_pago": self.metodo_pago,
            "subtotal": self.subtotal,
            "impuestos": self.impuestos,
            "descuento": self.descuento,
            "total": self.total,
            "productos": self.productos_detalle
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

# Modelo TokenBlocklist (para revocar tokens JWT)
class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, unique=True)  # ID único del token
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))