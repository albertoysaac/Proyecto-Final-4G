import React from 'react';
import { useContext } from 'react';
import { Context } from '../../../store/appContext';

export const CarritoVenta = () => {
    const { store, actions } = useContext(Context);
    const productos = store.carrito || []

    const onUpdateCantidad = (id, cantidad) => {
        actions.actualizarCantidad(id, cantidad);
    }
    const onDelete = (id) => {
        actions.eliminarProducto(id);
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700">
                <h2 className="text-lg font-semibold">{store.modo}</h2>
            </div>
            <div className="p-4">
                {productos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No hay productos en el carrito
                    </p>
                ) : (
                    <div className="space-y-4">
                        {productos.map((item, index) => (
                            <div 
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div className="flex-1">
                                    {console.log(item)}
                                    <h3 className="font-medium">{item.producto.nombre}</h3>
                                    <p className="text-sm text-gray-500">
                                        ${store.modo === "venta" ? item.precio_actual.venta : item.precio_actual.compra} x {item.cantidad}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onUpdateCantidad(item.producto.id, Math.max(1, item.cantidad - 1))}
                                            className="p-1 hover:bg-gray-200 rounded"
                                        >
                                            <i className="bi bi-dash"></i>
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.cantidad}
                                            onChange={(e) => onUpdateCantidad(item.producto.id, parseInt(e.target.value) || 1)}
                                            className="w-16 text-center border rounded p-1"
                                        />
                                        <button
                                            onClick={() => onUpdateCantidad(item.producto.id, item.cantidad + 1)}
                                            className="p-1 hover:bg-gray-200 rounded"
                                        >
                                            <i className="bi bi-plus"></i>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => onDelete(item.producto.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};