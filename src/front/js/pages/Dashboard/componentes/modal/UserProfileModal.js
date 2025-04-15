import React from "react";
import PropTypes from "prop-types";

const UserProfileModal = ({ isOpen, onClose, usuario }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4">
                <h2 className="text-2xl font-bold mb-6">Perfil del Usuario</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Nombre
                        </label>
                        <p className="text-lg">{usuario.nombre}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Apellido
                        </label>
                        <p className="text-lg">{usuario.apellido}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Email
                        </label>
                        <p className="text-lg">{usuario.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Rol
                        </label>
                        <p className="text-lg">{usuario.rol}</p>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

UserProfileModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    usuario: PropTypes.object.isRequired,
};

export default UserProfileModal;