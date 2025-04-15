import React, { useState } from "react";
import { useContext } from "react";
import { Context } from "../../../store/appContext";
import Modal from "../componentes/modal/modal";

export const TablaInventario = ({ inventario }) => {
  const { actions } = useContext(Context);
  const [editItem, setEditItem] = useState(null);

  const handleEdit = (item) => {
    setEditItem(item);
  };

  const handleSave = async (id, data) => {
    await actions.actualizarInventario(id, data);
    setEditItem(null);
  };

  const handleDelete = async (id) => {
    await actions.eliminarInventario(id);
    setEditItem(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Inventario
      </h3>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Cantidad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Cantidad Mínima
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Cantidad Máxima
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {inventario.length > 0 ? (
            inventario.map((item) => (
              <tr key={item.producto.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {item.producto.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.cantidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.cantidad_minima}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.cantidad_maxima}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                No hay productos en el inventario
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {editItem && (
        <Modal
          item={editItem}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
};
