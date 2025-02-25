import React, { useState } from "react";
import PropTypes from "prop-types";

export const ModalRegistroProducto = ({ producto, onClose, onGuardar, modo }) => {
    const [formData, setFormData] = useState({
        cantidad: producto.cantidad || 0,
        cantidad_maxima: producto.cantidad_maxima || 60,
        cantidad_minima: producto.cantidad_minima || 5,
        id_inventario: producto.id_inventario || "sin registro en inventario",
        precio_compra: producto.precio_actual?.compra || 0,
        precio_venta: producto.precio_actual?.venta || 0,
        categoria: producto.producto?.categoria || "",
        codigo: producto.producto?.codigo || "",
        descripcion: producto.producto?.descripcion || "",
        imagen_url: producto.producto?.imagen_url || "",
        marca: producto.producto?.marca || "",
        nombre: producto.producto?.nombre || "",
        unidad_medida: "pieza",
        ubicacion: producto.ubicacion || ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onGuardar(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4">
                <h2 className="text-2xl font-bold mb-6">{modo}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Código</label>
                            <input
                                type="text"
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
                            <input
                                type="text"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Categoría</label>
                            <input
                                type="text"
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Marca</label>
                            <input
                                type="text"
                                name="marca"
                                value={formData.marca}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Unidad de Medida</label>
                            <input
                                type="text"
                                name="unidad_medida"
                                value={formData.unidad_medida}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Cantidad</label>
                            <input
                                type="number"
                                name="cantidad"
                                value={formData.cantidad}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Cantidad Mínima</label>
                            <input
                                type="number"
                                name="cantidad_minima"
                                value={formData.cantidad_minima}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Cantidad Máxima</label>
                            <input
                                type="number"
                                name="cantidad_maxima"
                                value={formData.cantidad_maxima}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Ubicación</label>
                            <input
                                type="text"
                                name="ubicacion"
                                value={formData.ubicacion}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Precio de Compra</label>
                            <input
                                type="number"
                                step="0.01"
                                name="precio_compra"
                                value={formData.precio_compra}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Precio de Venta</label>
                            <input
                                type="number"
                                step="0.01"
                                name="precio_venta"
                                value={formData.precio_venta}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-lime-600 text-white rounded-lg"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ModalRegistroProducto.propTypes = {
    producto: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onGuardar: PropTypes.func.isRequired,
    modo: PropTypes.string.isRequired
};