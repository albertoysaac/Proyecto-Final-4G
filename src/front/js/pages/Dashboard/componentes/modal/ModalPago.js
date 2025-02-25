import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const ModalPago = ({ totales, onClose, onProcesar }) => {
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [montoRecibido, setMontoRecibido] = useState('');
    const [loading, setLoading] = useState(false);

    const cambio = parseFloat(montoRecibido) - totales.total;
    const puedeCompletar = metodoPago === 'efectivo' 
        ? parseFloat(montoRecibido) >= totales.total 
        : true;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!puedeCompletar) return;

        setLoading(true);
        await onProcesar(metodoPago);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Procesar Pago</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Método de Pago
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setMetodoPago('efectivo')}
                                    className={`p-4 rounded-lg border text-center ${
                                        metodoPago === 'efectivo'
                                            ? 'border-lime-500 bg-lime-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <i className="bi bi-cash text-2xl block mb-2"></i>
                                    Efectivo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMetodoPago('tarjeta')}
                                    className={`p-4 rounded-lg border text-center ${
                                        metodoPago === 'tarjeta'
                                            ? 'border-lime-500 bg-lime-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <i className="bi bi-credit-card text-2xl block mb-2"></i>
                                    Tarjeta
                                </button>
                            </div>
                        </div>

                        {metodoPago === 'efectivo' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Monto Recibido
                                </label>
                                <input
                                    type="number"
                                    value={montoRecibido}
                                    onChange={(e) => setMontoRecibido(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    min={totales.total}
                                    step="0.01"
                                    required
                                />
                                {parseFloat(montoRecibido) >= totales.total && (
                                    <div className="mt-2 text-green-600 font-medium">
                                        Cambio: ${cambio.toFixed(2)}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="border-t pt-4">
                            <div className="text-2xl font-bold text-center mb-4">
                                Total a Pagar: ${totales.total.toFixed(2)}
                            </div>
                            <button
                                type="submit"
                                disabled={!puedeCompletar || loading}
                                className={`w-full py-3 rounded-lg text-white font-medium ${
                                    !puedeCompletar || loading
                                        ? 'bg-gray-400'
                                        : 'bg-lime-600 hover:bg-lime-700'
                                }`}
                            >
                                {loading ? (
                                    <i className="bi bi-arrow-repeat animate-spin"></i>
                                ) : (
                                    'Completar Venta'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

ModalPago.propTypes = {
    totales: PropTypes.shape({
        total: PropTypes.number.isRequired
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onProcesar: PropTypes.func.isRequired
};