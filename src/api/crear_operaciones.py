from flask import Flask
from api.models import db, Usuarios, Tienda, UsuarioTienda, Producto, Inventario, HistorialPrecio, Caja, MovimientoCaja, Compra, DetalleCompra, Venta, DetalleVenta, PagoVenta, PagoCompra, MovimientoInventario, TokenBlocklist, LoginHistory
from datetime import datetime, timedelta
import random
import uuid
import pdb

# Importar la aplicación Flask
from api import create_app

app = create_app()

def crear_operaciones():
    try:
        # Obtener registros existentes
        usuarios = Usuarios.query.all()
        tiendas = Tienda.query.all()
        inventarios = Inventario.query.all()
        productos = Producto.query.all()

        # Crear cajas y movimientos de caja
        for tienda in tiendas:
            for day in range(1, 31):  # Simular 30 días de operaciones
                fecha = datetime.now() - timedelta(days=day)
                for usuario in tienda.usuarios:
                    if usuario.rol == 'vendedor':
                        # Registrar inicio de sesión
                        login_history = LoginHistory(usuario_email=usuario.usuario_email, tienda_id=tienda.id, login_time=fecha.replace(hour=8, minute=0), ip_address='192.168.1.1')
                        db.session.add(login_history)
                        db.session.flush()

                        # Obtener el monto final del día anterior
                        caja_anterior = Caja.query.filter_by(tienda_id=tienda.id, estado='cerrada').order_by(Caja.fecha_cierre.desc()).first()
                        monto_inicial = float(caja_anterior.monto_final) if caja_anterior else random.uniform(500, 1500)

                        # Abrir caja
                        caja = Caja(tienda_id=tienda.id, fecha_apertura=fecha.replace(hour=8, minute=0), monto_inicial=monto_inicial, estado='abierta', usuario_apertura_id=usuario.usuario_email)
                        db.session.add(caja)
                        db.session.flush()

                        # Registrar un movimiento de caja si se modifica la cantidad con la que se abre la caja
                        if random.choice([True, False]):
                            monto_modificado = random.uniform(100, 500)
                            movimiento_caja_inicial = MovimientoCaja(caja_id=caja.id, tipo='entrada', concepto='ajuste inicial', monto=monto_modificado, usuario_id=usuario.usuario_email, fecha=fecha.replace(hour=8, minute=5))
                            db.session.add(movimiento_caja_inicial)
                            db.session.flush()
                            caja.monto_inicial += monto_modificado

                        # Crear movimientos de caja, compras y ventas
                        for _ in range(random.randint(1, 5)):  # Simular varias operaciones por día
                            if random.choice([True, False]):
                                # Crear venta
                                venta = Venta(tienda_id=tienda.id, caja_id=caja.id, vendedor_id=usuario.usuario_email, tipo_comprobante='Factura', numero_comprobante=f"VENTA{uuid.uuid4()}", subtotal=random.uniform(100, 500), impuestos=random.uniform(10, 50), total=random.uniform(110, 550), metodo_pago='Efectivo')
                                db.session.add(venta)
                                db.session.flush()

                                # Crear detalles de venta
                                detalles_venta = [
                                    DetalleVenta(venta_id=venta.id, producto_id=inventarios[i % len(inventarios)].producto_id, cantidad=random.randint(1, 10), precio_unitario=random.uniform(50, 100), subtotal=random.uniform(100, 500))
                                    for i in range(1, random.randint(1, 5))
                                ]
                                db.session.add_all(detalles_venta)
                                db.session.flush()

                                # Crear pago de venta
                                pago_venta = PagoVenta(venta_id=venta.id, metodo='Efectivo', monto=venta.total)
                                db.session.add(pago_venta)
                                db.session.flush()

                                # Registrar movimiento de caja por venta
                                movimiento_caja_venta = MovimientoCaja(caja_id=caja.id, tipo='entrada', concepto='venta', monto=venta.total, usuario_id=usuario.usuario_email, fecha=fecha + timedelta(hours=random.randint(1, 8)), venta_id=venta.id)
                                db.session.add(movimiento_caja_venta)
                                db.session.flush()

                                # Actualizar inventario y registrar movimiento de inventario
                                for detalle in detalles_venta:
                                    inventario = Inventario.query.filter_by(tienda_id=tienda.id, producto_id=detalle.producto_id).first()
                                    if inventario:
                                        inventario.cantidad -= detalle.cantidad
                                        movimiento_inventario = MovimientoInventario(inventario_id=inventario.id, tipo='salida', cantidad=detalle.cantidad, motivo='venta', documento_id=venta.id, usuario_id=usuario.usuario_email)
                                        db.session.add(movimiento_inventario)
                                        db.session.flush()
                                    else:
                                        print(f"Inventario no encontrado para producto_id={detalle.producto_id} y tienda_id={tienda.id}")
                                        pdb.set_trace()  # Punto de interrupción si no se encuentra el inventario

                            else:
                                # Crear compra
                                compra = Compra(tienda_id=tienda.id, usuario_id=random.choice([u.email for u in usuarios if 'admin' in u.email]), tipo_comprobante='Factura', numero_comprobante=f"COMP{uuid.uuid4()}", subtotal=random.uniform(100, 500), impuestos=random.uniform(10, 50), total=random.uniform(110, 550))
                                db.session.add(compra)
                                db.session.flush()

                                # Crear detalles de compra
                                detalles_compra = [
                                    DetalleCompra(compra_id=compra.id, producto_id=inventarios[i % len(inventarios)].producto_id, cantidad=random.randint(10, 50), precio_unitario=random.uniform(10, 50), subtotal=random.uniform(100, 500))
                                    for i in range(1, random.randint(1, 5))
                                ]
                                db.session.add_all(detalles_compra)
                                db.session.flush()

                                # Crear pago de compra
                                pago_compra = PagoCompra(compra_id=compra.id, metodo='Transferencia', monto=compra.total)
                                db.session.add(pago_compra)
                                db.session.flush()

                                # Registrar movimiento de caja por compra
                                movimiento_caja_compra = MovimientoCaja(caja_id=caja.id, tipo='salida', concepto='compra', monto=compra.total, usuario_id=usuario.usuario_email, fecha=fecha + timedelta(hours=random.randint(1, 8)), compra_id=compra.id)
                                db.session.add(movimiento_caja_compra)
                                db.session.flush()

                                # Actualizar inventario y registrar movimiento de inventario
                                for detalle in detalles_compra:
                                    inventario = Inventario.query.filter_by(tienda_id=tienda.id, producto_id=detalle.producto_id).first()
                                    if inventario:
                                        inventario.cantidad += detalle.cantidad
                                        movimiento_inventario = MovimientoInventario(inventario_id=inventario.id, tipo='entrada', cantidad=detalle.cantidad, motivo='compra', documento_id=compra.id, usuario_id=usuario.usuario_email)
                                        db.session.add(movimiento_inventario)
                                        db.session.flush()

                                        # Registrar historial de precios si es necesario
                                        precio_actual = HistorialPrecio.query.filter_by(producto_id=detalle.producto_id, tienda_id=tienda.id, fecha_fin=None).first()
                                        if not precio_actual or precio_actual.precio_compra != detalle.precio_unitario:
                                            if precio_actual:
                                                precio_actual.fecha_fin = datetime.now()
                                                db.session.flush()
                                            historial_precio = HistorialPrecio(producto_id=detalle.producto_id, tienda_id=tienda.id, precio_compra=detalle.precio_unitario, precio_venta=detalle.precio_unitario * 1.5, fecha_inicio=datetime.now())
                                            db.session.add(historial_precio)
                                            db.session.flush()
                                    else:
                                        print(f"Inventario no encontrado para producto_id={detalle.producto_id} y tienda_id={tienda.id}")
                                        pdb.set_trace()  # Punto de interrupción si no se encuentra el inventario

                        # Calcular el monto final de la caja
                        ingresos = sum(float(m.monto) for m in caja.movimientos if m.tipo == 'entrada')
                        egresos = sum(float(m.monto) for m in caja.movimientos if m.tipo == 'salida')
                        caja.monto_final = caja.monto_inicial + ingresos - egresos

                        # Cerrar caja al final del día
                        caja.estado = 'cerrada'
                        caja.fecha_cierre = fecha.replace(hour=17, minute=0)
                        caja.usuario_cierre_id = usuario.usuario_email

                        # Registrar cierre de sesión
                        logout_time = fecha.replace(hour=17, minute=0)
                        token_blocklist = TokenBlocklist(jti=str(uuid.uuid4()), created_at=logout_time)
                        db.session.add(token_blocklist)

        print("Cajas y movimientos de caja creados.")

        db.session.commit()
        print("Transacciones confirmadas en la base de datos.")
    except Exception as e:
        db.session.rollback()
        print(f"Error al crear operaciones: {str(e)}")

if __name__ == "__main__":
    with app.app_context():
        crear_operaciones()