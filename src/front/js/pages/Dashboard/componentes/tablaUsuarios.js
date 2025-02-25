import React from "react";
import PropTypes from "prop-types";

export const TablaUsuarios = ({ usuario, onEdit, onDelete }) => {
  const getRolColor = (rol) => {
    const colors = {
      ceo: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      administrador:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      vendedor:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return (
      colors[rol] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-lime-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {usuario.nombre[0]}
                {usuario.apellido[0]}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {usuario.nombre} {usuario.apellido}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {usuario.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
          {usuario.autoridades.map((auth, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${getRolColor(
                  auth.rol
                )}`}
              >
                {auth.rol}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {auth.nombre}
              </span>
            </div>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm text-gray-900 dark:text-white">
            {formatDate(usuario.fecha_contratacion)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {usuario.hora_entrada} - {usuario.hora_salida}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex flex-col space-y-1">
          <span className="text-gray-900 dark:text-white">
            Estado: <span className="text-green-600">Activo</span>
          </span>
          <span className="text-gray-500 text-xs">Última actividad: Hoy</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onEdit(usuario)}
          className="text-lime-600 hover:text-lime-900 mr-3"
          title="Editar"
        >
          <i className="bi bi-pencil-square"></i>
        </button>
        <button
          onClick={() => onDelete(usuario.email)}
          className="text-red-600 hover:text-red-900"
          title="Eliminar"
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  );
};

TablaUsuarios.propTypes = {
  usuario: PropTypes.shape({
    nombre: PropTypes.string.isRequired,
    apellido: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    fecha_contratacion: PropTypes.string.isRequired,
    hora_entrada: PropTypes.string.isRequired,
    hora_salida: PropTypes.string.isRequired,
    autoridades: PropTypes.array.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
