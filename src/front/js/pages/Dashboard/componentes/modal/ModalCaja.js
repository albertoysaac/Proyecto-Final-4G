import React, { useState, useContext, useEffect } from "react";
import { Context } from "../../../../store/appContext";
import PropTypes from "prop-types";

const ModalCaja = ({ isOpen, onClose, onAbrirCaja, onCerrarCaja, cajaAbierta }) => {
	const { store } = useContext(Context);
    const [montoInicial, setMontoInicial] = useState(0);
    const [montoFinal, setMontoFinal] = useState(0);

	useEffect(() => {
		if (!cajaAbierta) {
			console.log(store.areaDeTrabajo);
			setMontoInicial(store?.areaDeTrabajo?.caja?.caja?.balance_actual);
		} else if (cajaAbierta) {
			setMontoInicial(store?.areaDeTrabajo?.caja?.monto_inicial);
		}
	}, [isOpen === true]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-6">{cajaAbierta ? "Cerrar Caja" : "Abrir Caja"}</h2>
                <div className="space-y-4">
                    {!cajaAbierta ? (
                        <>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Monto Inicial
                            </label>
                            <input
                                type="number"
                                value={montoInicial}
                                onChange={(e) => setMontoInicial(parseFloat(e.target.value))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 dark:text-white placeholder-gray-400 backdrop-blur-sm"
                            />
                            <button
                                onClick={() => onAbrirCaja(montoInicial)}
                                className="w-full py-2 px-4 bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                            >
                                Abrir Caja
                            </button>
                        </>
                    ) : (
                        <>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Monto Final
                            </label>
                            <input
                                type="number"
                                value={montoFinal}
                                onChange={(e) => setMontoFinal(parseFloat(e.target.value))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 dark:text-white placeholder-gray-400 backdrop-blur-sm"
                            />
                            <button
                                onClick={() => onCerrarCaja(montoFinal)}
                                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                            >
                                Cerrar Caja
                            </button>
                        </>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="mt-4 w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

ModalCaja.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAbrirCaja: PropTypes.func.isRequired,
    onCerrarCaja: PropTypes.func.isRequired,
    cajaAbierta: PropTypes.bool.isRequired,
};

export default ModalCaja;