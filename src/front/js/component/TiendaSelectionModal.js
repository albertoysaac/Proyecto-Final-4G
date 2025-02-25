import React, { useContext } from "react";
import { Context } from "../store/appContext";
import PropTypes from 'prop-types';

export const TiendaSelectionModal = ({ isOpen, onClose }) => {
    const { store, actions } = useContext(Context);

    const handleSeleccion = (tienda) => {
        console.log(tienda);
        actions.seleccionarTienda(tienda);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4">
                <h2 className="text-2xl font-bold mb-6">Selecciona una Tienda</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {store.usuariofirmado.autoridades.map((auth) => (
                        <div
                            key={auth.tienda.id}
                            onClick={() => handleSeleccion(auth)}
                            className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md 
                                     hover:shadow-lg transition-shadow cursor-pointer border-2 
                                     hover:border-blue-500"
                        >   
                            <h2 className="text-lg font-semibold">{auth.tienda.nombre}</h2>
                            <h3 className="text-sm text-gray-500">{auth.rol}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

TiendaSelectionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};