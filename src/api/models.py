from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func, desc, and_, case, distinct
db = SQLAlchemy()

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
            print(e)
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
                "id": rel.tienda_id,
                "nombre": Tienda.query.get(rel.tienda_id).nombre,
                "rol": rel.rol
            } for rel in self.tienda_roles],
            "usuario_activo": self.is_active
        }
# Modelo UsuarioTienda (relación muchos a muchos entre usuarios y tiendas)
class UsuarioTienda(db.Model):
    usuario_email = db.Column(db.String(120), db.ForeignKey('usuarios.email'), primary_key=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), primary_key=True)
    rol = db.Column(db.String(20), nullable=False)  # ceo, admin, vendedor
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))
    
    login_history = db.relationship('LoginHistory', backref='usuario_tienda')
    usuario = db.relationship('Usuarios', backref='tienda_roles')
    
    def serialize(self):
        return {
            "usuario": self.usuario.serialize(),
            "last_login": self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else None,
        }

# Modelo Historial de Inicio de Sesión
class LoginHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_email = db.Column(db.String(120), nullable=False)
    tienda_id = db.Column(db.Integer, nullable=False)
    login_time = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    ip_address = db.Column(db.String(45)) 
    
    __table_args__ = (
        db.ForeignKeyConstraint(
            ['usuario_email', 'tienda_id'],
            ['usuario_tienda.usuario_email', 'usuario_tienda.tienda_id']
        ),
    )
    def serialize(self):
        return {
            "usuario_email": self.usuario_email,
            "tienda_id": self.tienda_id,
            "login_time": self.login_time.strftime('%Y-%m-%d %H:%M:%S'),
            "ip_address": self.ip_address
        }

class Tienda(db.Model):
    """Modelo base para tiendas"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(120), nullable=False)
    direccion = db.Column(db.String(120), nullable=False)
    hora_apertura = db.Column(db.Time, nullable=False)
    hora_cierre = db.Column(db.Time, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))

    # Relaciones
    inventario = db.relationship('Inventario', backref='tienda', lazy='dynamic')
    ventas = db.relationship('Venta', backref='tienda', lazy='dynamic')
    compras = db.relationship('Compra', backref='tienda', lazy='dynamic')
    cajas = db.relationship('Caja', backref='tienda_relacion', lazy='dynamic')
    usuarios = db.relationship('UsuarioTienda', backref='tienda_relacion', lazy='dynamic')
    
    def get_estadisticas(self, fecha_inicio=None, fecha_fin=None):
        
        """Obtiene todas las estadísticas de la tienda"""
        if not fecha_inicio:
            fecha_inicio = datetime.now().replace(day=1)
        if not fecha_fin:
            fecha_fin = datetime.now()

        return {
            "ventas": self.get_estadisticas_ventas(fecha_inicio, fecha_fin),
            "compras": self.get_estadisticas_compras(fecha_inicio, fecha_fin),
            "inventario": self.get_estadisticas_inventario(),
            "productos": self.get_estadisticas_productos(fecha_inicio, fecha_fin),
            "usuarios": self.get_estadisticas_usuarios(fecha_inicio, fecha_fin),
            "caja": self.get_estadisticas_caja(fecha_inicio, fecha_fin)
        }
    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "hora_apertura": self.hora_apertura.strftime('%H:%M:%S'),
            "hora_cierre": self.hora_cierre.strftime('%H:%M:%S')
        }
    
    

class Producto(db.Model):
    """Modelo base para productos"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False)
    nombre = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    categoria = db.Column(db.String(50), nullable=False)
    marca = db.Column(db.String(50), nullable=False)
    unidad_medida = db.Column(db.String(20), nullable=False)
    imagen_url = db.Column(db.String(255), nullable=True)  
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))

    # Relaciones
    inventarios = db.relationship('Inventario', backref='producto', lazy='dynamic')
    historial_precios = db.relationship('HistorialPrecio', backref='producto', lazy='dynamic')

    def serialize(self):
        return {
            "id": self.id,
            "codigo": self.codigo,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "categoria": self.categoria,
            "marca": self.marca,
            "unidad_medida": self.unidad_medida,
            "imagen_url": self.imagen_url  
        }
    
class Inventario(db.Model):
    """Modelo para gestionar el inventario de productos por tienda"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    cantidad = db.Column(db.Float, default=0)
    cantidad_minima = db.Column(db.Float, default=5)
    cantidad_maxima = db.Column(db.Float, nullable=True)
    ubicacion = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=datetime.now(timezone.utc))
    
    def serialize(self):
        return {
            "id": self.id,
            "producto": self.producto.serialize(),
            "cantidad": float(self.cantidad),
            "cantidad_minima": float(self.cantidad_minima),
            "cantidad_maxima": float(self.cantidad_maxima) if self.cantidad_maxima else None,
            "ubicacion": self.ubicacion
        }

    # Índices y restricciones
    __table_args__ = (
        db.UniqueConstraint('tienda_id', 'producto_id', name='uix_tienda_producto'),
        db.Index('idx_inventario_cantidad', 'cantidad'),
    )
    def fullserialize(self):
        precio_actual = HistorialPrecio.query.filter_by(
            producto_id=self.producto_id,
            tienda_id=self.tienda_id,
            fecha_fin=None
        ).first()
        
        return {
            "id": self.id,
            "producto": self.producto.serialize(),
            "cantidad": float(self.cantidad),
            "cantidad_minima": float(self.cantidad_minima),
            "cantidad_maxima": float(self.cantidad_maxima) if self.cantidad_maxima else None,
            "ubicacion": self.ubicacion,
            "precio_actual": {
                "compra": float(precio_actual.precio_compra) if precio_actual else None,
                "venta": float(precio_actual.precio_venta) if precio_actual else None
            }
        }
        
    @classmethod
    def calcular_estadisticas(cls):
        """Calcula estadísticas de inventario"""
        total_productos = db.session.query(func.count(cls.id)).scalar() or 0
        productos_bajo_stock = db.session.query(func.count(cls.id)).filter(
            cls.cantidad <= cls.cantidad_minima
        ).scalar() or 0

        return {
            "total_productos": total_productos,
            "productos_bajo_stock": productos_bajo_stock
        }

class HistorialPrecio(db.Model):
    """Modelo para registrar el historial de precios de productos"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    precio_compra = db.Column(db.Numeric(10, 2), nullable=False)
    precio_venta = db.Column(db.Numeric(10, 2), nullable=False)
    fecha_inicio = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    fecha_fin = db.Column(db.DateTime, nullable=True)
    
    # Índices
    __table_args__ = (
        db.Index('idx_historial_precios_fecha', 'fecha_inicio', 'fecha_fin'),
    )
    def serialize(self):
        return {
            "id": self.id,
            "producto": self.producto.serialize(),
            "precio_compra": float(self.precio_compra),
            "precio_venta": float(self.precio_venta),
            "fecha_inicio": self.fecha_inicio.strftime('%Y-%m-%d %H:%M:%S'),
            "fecha_fin": self.fecha_fin.strftime('%Y-%m-%d %H:%M:%S') if self.fecha_fin else None
        }
        

class Venta(db.Model):
    """Modelo base para ventas"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    caja_id = db.Column(db.Integer, db.ForeignKey('caja.id'), nullable=False)
    vendedor_id = db.Column(db.String(120), db.ForeignKey('usuarios.email'), nullable=False)
    fecha = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    tipo_comprobante = db.Column(db.String(20), nullable=False)
    numero_comprobante = db.Column(db.String(150), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    impuestos = db.Column(db.Numeric(10, 2), nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    metodo_pago = db.Column(db.String(20), nullable=False)
    estado = db.Column(db.String(20), default='completada')
    
    # Índices
    __table_args__ = (
        db.Index('idx_ventas_fecha', 'fecha'),
        db.Index('idx_ventas_estado', 'estado'),
    )
    
    # Relaciones
    detalles = db.relationship('DetalleVenta', backref='venta', lazy='dynamic')
    pagos = db.relationship('PagoVenta', backref='venta', lazy='dynamic')
    
    def serialize(self):
        vendedor = Usuarios.query.get(self.vendedor_id)

        return {
            "id": self.id,
            "fecha": self.fecha.strftime('%Y-%m-%d %H:%M:%S'),
            "tipo_comprobante": self.tipo_comprobante,
            "numero_comprobante": self.numero_comprobante,
            "subtotal": float(self.subtotal),
            "impuestos": float(self.impuestos),
            "total": float(self.total),
            "metodo_pago": self.metodo_pago,
            "estado": self.estado,
            "detalles": [d.serialize() for d in self.detalles],
            "vendedor": vendedor.serialize() if vendedor else None
        }
        
    @classmethod
    def calcular_estadisticas(cls, fecha_inicio, fecha_fin):
        """Calcula estadísticas de ventas en un rango de fechas"""
        stats = db.session.query(
            func.coalesce(func.sum(cls.total), 0).label('total'),
            func.count(cls.id).label('num_transacciones')
        ).filter(
            cls.fecha.between(fecha_inicio, fecha_fin)
        ).first()

        total = float(stats.total)
        num_transacciones = float(stats.num_transacciones)

        return {
            "total": total,
            "num_transacciones": num_transacciones
        }
        
    @classmethod
    def calcular_mejores_vendedores(cls, fecha_inicio, fecha_fin):
        """Calcula los mejores vendedores en un rango de fechas"""
        vendedores = db.session.query(
            Usuarios,
            func.count(cls.id).label('num_ventas'),
            func.sum(cls.total).label('total_ventas'),
            func.avg(cls.total).label('promedio_ticket')
        ).join(Usuarios).filter(
            cls.fecha.between(fecha_inicio, fecha_fin)
        ).group_by(Usuarios.email).order_by(desc('total_ventas')).limit(5).all()

        return [{
            "usuario": u.serialize(),
            "num_ventas": int(num_ventas),
            "total_ventas": float(total_ventas),
            "promedio_ticket": float(promedio_ticket),
            "tienda_id": u.tienda_roles[0].tienda_id  # Asumiendo que cada usuario tiene al menos un rol en una tienda
        } for u, num_ventas, total_ventas, promedio_ticket in vendedores]

class DetalleVenta(db.Model):
    """Modelo para detalles de venta"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    venta_id = db.Column(db.Integer, db.ForeignKey('venta.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    cantidad = db.Column(db.Float, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
	
	# Relación con Producto
    producto = db.relationship('Producto', backref='detalles_venta')
    
    def serialize(self):
        return {
            "id": self.id,
            "producto": self.producto.serialize(),
            "cantidad": float(self.cantidad),
            "precio_unitario": float(self.precio_unitario),
            "subtotal": float(self.subtotal)
        }
        
    @classmethod
    def calcular_mas_vendidos(cls, fecha_inicio, fecha_fin):
        """Calcula los productos más vendidos en un rango de fechas"""
        productos = db.session.query(
            Producto,
            func.sum(cls.cantidad).label('cantidad_vendida'),
            func.sum(cls.subtotal).label('total_vendido'),
            func.sum(cls.subtotal - (HistorialPrecio.precio_venta * cls.cantidad)).label('ganancia')
        ).join(Producto).join(Venta).join(HistorialPrecio, and_(
            HistorialPrecio.producto_id == cls.producto_id,
            HistorialPrecio.tienda_id == Venta.tienda_id,
            HistorialPrecio.fecha_fin == None
        )).filter(
            Venta.fecha.between(fecha_inicio, fecha_fin)
        ).group_by(Producto.id).order_by(desc('cantidad_vendida')).limit(3).all()

        productos_mas_vendidos = []
        for p, cantidad, total, ganancia in productos:
            try:
                total_vendido = float(total)
                ganancia_float = float(ganancia)
                margen = (ganancia_float / total_vendido * 100) if total_vendido > 0 else 0
                productos_mas_vendidos.append({
                    "producto": p.serialize(),
                    "cantidad_vendida": int(cantidad),
                    "total_vendido": total_vendido,
                    "ganancia": ganancia_float,
                    "margen": margen
                })
            except Exception as e:
                print(e)

        return productos_mas_vendidos
    
    
class Compra(db.Model):
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    usuario_id = db.Column(db.String(120), db.ForeignKey('usuarios.email'), nullable=False)
    fecha = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    tipo_comprobante = db.Column(db.String(20), nullable=False)
    numero_comprobante = db.Column(db.String(150), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    impuestos = db.Column(db.Numeric(10, 2), nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    estado = db.Column(db.String(20), default='completada')

    # Relaciones
    detalles = db.relationship('DetalleCompra', backref='compra', lazy='dynamic')
    pagos = db.relationship('PagoCompra', backref='compra', lazy='dynamic')
    usuario = db.relationship('Usuarios', backref='compras')

    # Índices
    __table_args__ = (
        db.Index('idx_compras_fecha', 'fecha'),
        db.Index('idx_compras_estado', 'estado'),
    )

    def serialize(self):
        return {
            "id": self.id,
            "fecha": self.fecha.strftime('%Y-%m-%d %H:%M:%S'),
            "tipo_comprobante": self.tipo_comprobante,
            "numero_comprobante": self.numero_comprobante,
            "subtotal": float(self.subtotal),
            "impuestos": float(self.impuestos),
            "total": float(self.total),
            "estado": self.estado,
            "detalles": [d.serialize() for d in self.detalles],
            "vendedor": self.usuario.serialize()
        }
    @classmethod
    def calcular_estadisticas(cls, fecha_inicio, fecha_fin):
        """Calcula estadísticas de compras en un rango de fechas"""
        total_compras = db.session.query(func.sum(cls.total)).filter(
            cls.fecha.between(fecha_inicio, fecha_fin)
        ).scalar() or 0
        num_compras = db.session.query(func.count(cls.id)).filter(
            cls.fecha.between(fecha_inicio, fecha_fin)
        ).scalar() or 0

        return {
            "total_compras": total_compras,
            "num_compras": num_compras
        }
        
class DetalleCompra(db.Model):
    """Modelo para detalles de compra"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    compra_id = db.Column(db.Integer, db.ForeignKey('compra.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    cantidad = db.Column(db.Float, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Relación con Producto
    producto = db.relationship('Producto', backref='detalles_compra')
    
    def serialize(self):
        return {
            "id": self.id,
            "producto": self.producto.serialize(),
            "cantidad": float(self.cantidad),
            "precio_unitario": float(self.precio_unitario),
            "subtotal": float(self.subtotal)
        }
        
class PagoVenta(db.Model):
    """Modelo para registrar pagos de ventas"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    venta_id = db.Column(db.Integer, db.ForeignKey('venta.id'), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    metodo = db.Column(db.String(20), nullable=False)
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    referencia = db.Column(db.String(50), nullable=True)
    estado = db.Column(db.String(20), default='completado')

    # Índices
    __table_args__ = (
        db.Index('idx_pagos_venta_fecha', 'fecha'),
        db.Index('idx_pagos_venta_estado', 'estado'),
    )

class PagoCompra(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    compra_id = db.Column(db.Integer, db.ForeignKey('compra.id'), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    metodo = db.Column(db.String(20), nullable=False)
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    referencia = db.Column(db.String(50), nullable=True)
    estado = db.Column(db.String(20), default='completado')

    # Índices
    __table_args__ = (
        db.Index('idx_pagos_compra_fecha', 'fecha'),
        db.Index('idx_pagos_compra_estado', 'estado'),
    )

class MovimientoInventario(db.Model):
    """Modelo para registrar movimientos de inventario"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    inventario_id = db.Column(db.Integer, db.ForeignKey('inventario.id'), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # entrada, salida, ajuste
    cantidad = db.Column(db.Float, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    motivo = db.Column(db.String(50), nullable=False)  # venta, compra, merma, etc
    documento_id = db.Column(db.Integer, nullable=True)  # ID de venta, compra, etc
    usuario_id = db.Column(db.String(120), db.ForeignKey('usuarios.email'), nullable=False)

	# Relaciones
    inventario = db.relationship('Inventario', backref='movimientos')
    usuario = db.relationship('Usuarios', backref='movimientos_inventario')
    
    # Índices
    __table_args__ = (
        db.Index('idx_movimientos_inv_fecha', 'fecha'),
        db.Index('idx_movimientos_inv_tipo', 'tipo'),
    )
    
    def serialize(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "cantidad": float(self.cantidad),
            "fecha": self.fecha.strftime('%Y-%m-%d %H:%M:%S'),
            "motivo": self.motivo,
            "documento_id": self.documento_id,
            "usuario": self.usuario.nombre
        }
class Estadisticas(db.Model):
    """Modelo para almacenar estadísticas precalculadas"""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    metricas = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # Índices
    __table_args__ = (
        db.UniqueConstraint('tienda_id', 'fecha', name='uix_tienda_fecha'),
        db.Index('idx_estadisticas_fecha', 'fecha'),
    )
    
    @staticmethod
    def calcular_estadisticas_diarias(tienda_id, fecha_inicio, fecha_fin):
        """Calcula las estadísticas diarias de ventas en un rango de fechas"""
        estadisticas_diarias = db.session.query(
            func.date(Venta.fecha).label('fecha'),
            func.sum(Venta.total).label('total_ventas'),
            func.count(Venta.id).label('num_ventas'),
        ).filter(
            Venta.tienda_id == tienda_id,
            Venta.fecha.between(fecha_inicio, fecha_fin)
        ).group_by(
            func.date(Venta.fecha)
        ).order_by(
            func.date(Venta.fecha)
        ).all()

        return {
            "ventas": {
                "crecimiento": [{
                    "fecha": stats.fecha.strftime('%Y-%m-%d'),
                    "total": float(stats.total_ventas or 0),
                    "num_ventas": int(stats.num_ventas or 0)
                } for stats in estadisticas_diarias]
            }
        }

    @staticmethod
    def obtener_estadisticas_consolidadas(fecha_inicio, fecha_fin, tiendas_ids=None):
        
        

        # Obtener estadísticas de ventas
        ventas = Venta.calcular_estadisticas(fecha_inicio, fecha_fin)
        

        # Obtener estadísticas de compras
        compras = Compra.calcular_estadisticas(fecha_inicio, fecha_fin)
        


        # Obtener estadísticas de balance
        ingresos = float(db.session.query(
            func.sum(MovimientoCaja.monto).label('total_ingresos')
        ).filter(
            MovimientoCaja.tipo == 'entrada',
            MovimientoCaja.fecha.between(fecha_inicio, fecha_fin)
        ).scalar() or 0)
        


        egresos = float(db.session.query(
            func.sum(MovimientoCaja.monto).label('total_egresos')
        ).filter(
            MovimientoCaja.tipo == 'salida',
            MovimientoCaja.fecha.between(fecha_inicio, fecha_fin)
        ).scalar() or 0)
        

        balance = ingresos - egresos

        # Obtener estadísticas de inventario
        total_productos = int(db.session.query(func.count(Inventario.id)).scalar() or 0)
        
        
        productos_bajo_stock = db.session.query(Inventario).filter(
            Inventario.cantidad <= Inventario.cantidad_minima
        ).all()
        

        # Calcular el porcentaje de productos que quedan en stock
        productos_totales = float(db.session.query(func.sum(Inventario.cantidad)).scalar() or 0)
        productos_minimos = float(db.session.query(func.sum(Inventario.cantidad_minima)).scalar() or 0)
        porcentaje_productos = (productos_totales / productos_minimos) * 100 if productos_minimos > 0 else 0
        
        productos_bajo_stock_serialized = [
            {
                "producto": p.producto.serialize(),
                "cantidad": float(p.cantidad),
                "cantidad_minima": float(p.cantidad_minima),
                "porcentaje": (float(p.cantidad) / float(p.cantidad_minima)) * 100 if p.cantidad_minima > 0 else 0
            }
            for p in productos_bajo_stock
        ]
        

        # Obtener productos más vendidos
        productos_mas_vendidos = DetalleVenta.calcular_mas_vendidos(fecha_inicio, fecha_fin)
        
        # Obtener mejores vendedores
        mejores_vendedores = Venta.calcular_mejores_vendedores(fecha_inicio, fecha_fin)
        
        # Obtener crecimiento de ventas
        
        
        crecimiento_ventas = db.session.query(
            func.date_trunc('day', Venta.fecha).label('fecha'),
            func.sum(Venta.total).label('total')
        ).filter(
            Venta.fecha.between(fecha_inicio, fecha_fin)
        ).group_by('fecha').order_by('fecha').all()
        

        crecimiento_ventas = [
            {"fecha": c.fecha.strftime('%Y-%m-%d'), "valor": float(c.total)}
            for c in crecimiento_ventas
        ]
        

        # Obtener distribución de ventas por tienda
        ventas_por_tienda = db.session.query(
            Tienda.nombre.label('nombre'),
            func.sum(Venta.total).label('total')
        ).join(Venta).group_by(Tienda.nombre).order_by(desc('total')).all()
        
        ventas_por_tienda = [
            {"nombre": v.nombre, "valor": float(v.total)}
            for v in ventas_por_tienda
        ]
        
        return {
            "balance": {
                "balance": balance,
                "total_egresos": egresos,
                "total_ingresos": ingresos
            },
            "inventario": {
                "productos_bajo_stock": productos_bajo_stock_serialized,
                "total_productos": total_productos,
                "porcentaje_productos": porcentaje_productos
            },
            "productos": {
                "mas_vendidos": productos_mas_vendidos
            },
            "ventas": {
                "num_transacciones": ventas["num_transacciones"],
                "total": ventas["total"],
                "crecimiento": crecimiento_ventas,
                "por_tienda": ventas_por_tienda
            },
            "compras": {
                "num_compras": compras["num_compras"],
                "total_compras": float(compras["total_compras"])
            },
            "usuarios": mejores_vendedores
        }

class Caja(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tienda.id'), nullable=False)
    fecha_apertura = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    fecha_cierre = db.Column(db.DateTime, nullable=True)
    monto_inicial = db.Column(db.Numeric(10, 2), nullable=False)
    monto_final = db.Column(db.Numeric(10, 2), nullable=True)
    estado = db.Column(db.String(20), default='abierta')  # abierta, cerrada
    usuario_apertura_id = db.Column(db.String(120), db.ForeignKey('usuarios.email'))
    usuario_cierre_id = db.Column(db.String(120), db.ForeignKey('usuarios.email'), nullable=True)
    
    usuario_apertura = db.relationship('Usuarios', foreign_keys=[usuario_apertura_id])
    usuario_cierre = db.relationship('Usuarios', foreign_keys=[usuario_cierre_id])
    movimientos = db.relationship('MovimientoCaja', backref='caja')

    def serialize(self):
        return {
            "id": self.id,
            "fecha_apertura": self.fecha_apertura.strftime('%Y-%m-%d %H:%M:%S'),
            "fecha_cierre": self.fecha_cierre.strftime('%Y-%m-%d %H:%M:%S') if self.fecha_cierre else None,
            "monto_inicial": float(self.monto_inicial),
            "monto_final": float(self.monto_final) if self.monto_final else None,
            "estado": self.estado,
            "usuario_apertura": self.usuario_apertura.nombre,
            "usuario_cierre": self.usuario_cierre.nombre if self.usuario_cierre else None,
            "balance_actual": self.calcular_balance()
        }

    def calcular_balance(self):
        """Calcula el balance actual de la caja"""
        ingresos = sum(float(m.monto) for m in self.movimientos if m.tipo == 'entrada')
        egresos = sum(float(m.monto) for m in self.movimientos if m.tipo == 'salida')
        return float(self.monto_inicial) + ingresos - egresos

class MovimientoCaja(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    caja_id = db.Column(db.Integer, db.ForeignKey('caja.id'), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # entrada, salida
    concepto = db.Column(db.String(50), nullable=False)  # venta, compra, retiro, error_conteo, etc
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    usuario_id = db.Column(db.String(120), db.ForeignKey('usuarios.email'), nullable=False)
    venta_id = db.Column(db.Integer, db.ForeignKey('venta.id'), nullable=True)
    compra_id = db.Column(db.Integer, db.ForeignKey('compra.id'), nullable=True)
    observacion = db.Column(db.String(255), nullable=True)
    
    # Relaciones
    usuario = db.relationship('Usuarios', backref='movimientos_caja')
    venta = db.relationship('Venta', backref='movimiento_caja', uselist=False)
    compra = db.relationship('Compra', backref='movimiento_caja', uselist=False)
    
    def serialize(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "concepto": self.concepto,
            "monto": float(self.monto),
            "fecha": self.fecha.strftime('%Y-%m-%d %H:%M:%S'),
            "usuario": self.usuario.nombre,
            "venta_id": self.venta_id,
            "compra_id": self.compra_id,
            "observacion": self.observacion
        }

    # Índices para optimización
    __table_args__ = (
        db.Index('idx_movimientos_caja_fecha', 'fecha'),
        db.Index('idx_movimientos_caja_tipo', 'tipo'),
    )

# Modelo TokenBlocklist (para revocar tokens JWT)
class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    jti = db.Column(db.String(36), nullable=False, unique=True)  # ID único del token
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
