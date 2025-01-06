import React from "react";
import PropTypes from "prop-types";

export const CardComentarios = ({datos}) => {
    return (
        <div className="card cad-comentario" >
            <div className="card-body">
                <h5 className="card-title nombre">Nombre: {datos.nombre}</h5>
                <h6 className="card-subtitle cargo mb-2 text-body-secondary">Cargo: {datos.cargo}</h6>
                <p className="card-text comentario">comentario: {datos.comentario}</p>
            </div>
        </div>
    );
}