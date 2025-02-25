import React from "react";
import PropTypes from "prop-types";

export const ResumenVenta = ({ totales, onProcesarPago, disabled }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Resumen de la Venta
            </h3>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">${totales.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Impuestos:</span>
                    <span className="text-gray-900 dark:text-white">${totales.impuestos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Descuento:</span>
                    <span className="text-gray-900 dark:text-white">-${totales.descuento.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">${totales.total.toFixed(2)}</span>
                </div>
            </div>
            <button
                onClick={onProcesarPago}
                disabled={disabled}
                className={`mt-4 w-full px-4 py-2 rounded-lg text-white ${disabled ? "bg-gray-400" : "bg-lime-600 hover:bg-lime-700"}`}
            >
                Procesar Pago
            </button>
        </div>
    );
};

ResumenVenta.propTypes = {
    totales: PropTypes.shape({
        subtotal: PropTypes.number.isRequired,
        impuestos: PropTypes.number.isRequired,
        descuento: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired,
    }).isRequired,
    onProcesarPago: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
};