import React, { useState } from "react";
import PropTypes from "prop-types";

const Modal = ({ item, onSave, onDelete, onClose }) => {
  const [data, setData] = useState({
    cantidad: item.cantidad,
    cantidad_minima: item.cantidad_minima,
    cantidad_maxima: item.cantidad_maxima,
    ubicacion: item.ubicacion,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(item.id, data);
  };

  const handleDelete = () => {
    onDelete(item.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Editar Producto</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cantidad
            </label>
            <input
              type="number"
              name="cantidad"
              value={data.cantidad}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cantidad Mínima
            </label>
            <input
              type="number"
              name="cantidad_minima"
              value={data.cantidad_minima}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cantidad Máxima
            </label>
            <input
              type="number"
              name="cantidad_maxima"
              value={data.cantidad_maxima}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ubicación
            </label>
            <input
              type="text"
              name="ubicacion"
              value={data.ubicacion}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </form>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-lime-600 text-white rounded-md"
          >
            Guardar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  item: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;