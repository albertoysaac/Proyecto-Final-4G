import React, { useEffect, useState, useContext } from "react";
import { Context } from "../../../store/appContext";
import {ResumenVenta} from "../componentes/ResumenVenta";
import {CarritoVenta} from "../componentes/carritoVenta";
import {BuscadorProductos} from "../componentes/buscadorProductos";

const ModalPago = React.lazy(() => import("../componentes/modal/ModalPago"));
const ModalCaja = React.lazy(() => import("../componentes/modal/ModalCaja"));

const Ventas = () => {
    const { store, actions } = useContext(Context);
	const carrito = store.carrito || [];
    const [showModalPago, setShowModalPago] = useState(false);
    const [showModalProducto, setShowModalProducto] = useState(false);
    const [productoTemp, setProductoTemp] = useState(null);
    const [totales, setTotales] = useState({
        subtotal: 0,
        impuestos: 0,
        descuento: 0,
        total: 0,
    });
    useEffect(() => {
		if (store.areaDeTrabajo.id){
			actions.getInventarioTienda(store.areaDeTrabajo.id);
		}
    }, []);

	useEffect(() => {
		setTotales({
            subtotal: store.carrito.reduce(
                (acc, item) => acc + (store.modo === "venta" ? item.precio_actual.venta : item.precio_actual.compra) * item.cantidad,
                0
            ),
            impuestos: 0,
            descuento: 0,
            total: carrito.reduce(
                (acc, item) => acc + (store.modo === "venta" ? item.precio_actual.venta : item.precio_actual.compra) * item.cantidad,
                0
            ),
        });
	}, [store.carrito]); 

    const procesarOperacion = async (metodoPago) => {
        try {
            if (store.modo === "venta") {
                await actions.procesarVenta({
                    tienda_id: store.areaDeTrabajo.id,
                    tipo_comprobante: "ticket",
                    numero_comprobante: "n/a",
                    subtotal: totales.subtotal,
                    impuestos: totales.impuestos,
                    descuento: totales.descuento,
                    total: totales.total,
                    metodo_pago: metodoPago,
                    detalles: store.carrito.map((item) => ({
                        producto_id: item.producto.id,
                        cantidad: item.cantidad,
                        precio_unitario: item.precio_actual.venta,
                        subtotal: item.precio_actual.venta * item.cantidad,
                    })),
                });
            } else if (store.modo === "compra") {
                await actions.procesarCompra({
                    tienda_id: store.areaDeTrabajo.id,
                    tipo_comprobante: "ticket",
                    numero_comprobante: "n/a",
                    subtotal: totales.subtotal,
                    impuestos: totales.impuestos,
                    descuento: totales.descuento,
                    total: totales.total,
                    metodo_pago: metodoPago,
                    detalles: store.carrito.map((item) => ({
                        producto_id: item.producto.id,
                        cantidad: item.cantidad,
                        precio_unitario: item.precio_actual.compra,
                        subtotal: item.precio_actual.compra * item.cantidad,
                    })),
                });
            }
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div className="h-full flex flex-col">
            <header className="bg-white dark:bg-gray-800 shadow px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {store.modo === "venta" ? "compra" : "Registro de Compra"}
                        </h1>
                        <select
                            value={store.modo}
                            onChange={(e) => {
                                setModo(e.target.value);
                            }}
                            className="border rounded-lg px-3 py-2"
                        >
                            <option value="venta">Venta</option>
                            <option value="compra">Compra</option>
                        </select>
                    </div>
                    {store.modo === "venta" && (
                        <div className="flex items-center space-x-4">
                            {store.caja.estado === "abierta" ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    Caja Abierta
                                </span>
                            ) : (
                                <button
                                    onClick={() =>
                                        actions.abrirCaja({
                                            tienda_id: store.areaDeTrabajo.id,
                                            monto_inicial: 0,
                                        })
                                    }
                                    className="px-4 py-2 bg-lime-600 text-white rounded-lg"
                                >
                                    Abrir Caja
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <BuscadorProductos />
                        <CarritoVenta/>
                    </div>
                    <div>
                        <ResumenVenta
                            totales={totales}
                            onProcesarPago={() => setShowModalPago(true)}
                            disabled={store.caja.estado === "abierta" ? true : false}
                        />
                    </div>
                </div>
            </div>

            {showModalPago && (
                <ModalPago
                    totales={totales}
                    onClose={() => setShowModalPago(false)}
                    onProcesar={procesarOperacion}
                />
            )}
        </div>
    );
};

export default Ventas;