import React from "react";
import PropTypes from "prop-types";

const CardComentarios = ({datos}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 
                        transform hover:scale-105 transition-transform duration-300">
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-lime-600 rounded-full flex items-center justify-center">
                        <span className="text-xl text-white font-bold">
                            {datos.nombre[0]}
                        </span>
                    </div>
                    <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">
                            {datos.nombre}
                        </h5>
                        <h6 className="text-sm text-gray-600 dark:text-gray-400">
                            {datos.cargo}
                        </h6>
                    </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                    "{datos.comentario}"
                </p>
            </div>
        </div>
    );
};

CardComentarios.propTypes = {
    datos: PropTypes.shape({
        nombre: PropTypes.string.isRequired,
        cargo: PropTypes.string.isRequired,
        comentario: PropTypes.string.isRequired
    }).isRequired
};

export default CardComentarios;