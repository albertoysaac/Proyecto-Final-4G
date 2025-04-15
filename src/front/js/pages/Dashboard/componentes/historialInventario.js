import React from "react";

const HistorialInventario = ({ inventario = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Historial de Inventario
      </h3>
      <ul className="space-y-2">
        {console.log(inventario)}
        {inventario.historial_inventario.map((item, index) => (
          <li
            key={index}
            className="p-4 border rounded-lg flex justify-between items-center"
            style={{ backgroundColor: "#f3e5f5" }}
          >
            <span>{item.fecha}</span>
            <span>{item.producto.nombre}</span>
            <span>{item.cantidad}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistorialInventario;