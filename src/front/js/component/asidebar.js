import React, { useState, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Context } from "../store/appContext";

const TiendaSelectionModal = React.lazy(() => import("./TiendaSelectionModal"));
const UserProfileModal = React.lazy(() => import("../pages/Dashboard/componentes/modal/UserProfileModal"));

const Asidebar = () => {
  const { store, actions } = useContext(Context);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTiendaModal, setShowTiendaModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const location = useLocation();
  const isCEO =
    store.authdata?.rol === "ceo" || store.authdata?.autoridades?.rol === "ceo";
  const isAdmin = store.authdata?.autoridades?.rol === "administrador";

  const menuItems = {
    ceo: [
      {
        path: "/dashboard/global",
        icon: "bi-graph-up",
        text: "Estadísticas Globales",
      },
      {
        path: "/dashboard/inicio",
        icon: "bi-speedometer2",
        text: "Tienda",
      },
      {
        path: "/dashboard/usuarios",
        icon: "bi-people",
        text: "Usuarios",
      },
      {
        path: "/dashboard/ventas",
        icon: "bi bi-cart3",
        text: "Ventas",
      },
      {
        path: "/dashboard/historial",
        icon: "bi-clock-history",
        text: "Historial",
      },
      {
        path: "/dashboard/inventario",
        icon: "bi-box-seam",
        text: "Inventario",
      },
    ],
    admin: [
      {
        path: "/dashboard/inicio",
        icon: "bi-speedometer2",
        text: "Tienda",
      },
      {
        path: "/dashboard/usuarios",
        icon: "bi-people",
        text: "Usuarios",
      },
      {
        path: "/dashboard/ventas",
        icon: "bi bi-cart3",
        text: "Ventas",
      },
      {
        path: "/dashboard/historial",
        icon: "bi-clock-history",
        text: "Historial",
      },
      {
        path: "/dashboard/inventario",
        icon: "bi-box-seam",
        text: "Inventario",
      },
    ],
    vendedor: [
      {
        path: "/dashboard/inicio",
        icon: "bi-speedometer2",
        text: "Tienda",
      },
      {
        path: "/dashboard/ventas",
        icon: "bi-cart3",
        text: "Ventas",
      },
      {
        path: "/dashboard/inventario",
        icon: "bi-box-seam",
        text: "Inventario",
      },
    ],
  };
  // selecionar el menu dependiendo del rol
  const currentMenu = isCEO
    ? menuItems.ceo
    : isAdmin
    ? menuItems.admin
    : menuItems.vendedor;

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 ${
          isExpanded ? "w-64" : "w-16"
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="h-full flex flex-col justify-between py-6">
          <nav className="space-y-2">
            {currentMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                                flex items-center ${
                                  isExpanded
                                    ? "justify-start"
                                    : "justify-center"
                                } w-full p-3 rounded-lg
                                ${
                                  isActive
                                    ? "text-lime-600 bg-lime-50 dark:text-lime-400 dark:bg-lime-900/20"
                                    : "text-gray-500 hover:text-lime-600 hover:bg-lime-50 dark:text-gray-400 dark:hover:text-lime-400 dark:hover:bg-lime-900/20"
                                }
                            `}
              >
                <i className={`bi ${item.icon} text-xl`}></i>
                {isExpanded && <span className="ml-4">{item.text}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="px-2">
            <button
              onClick={() => setShowUserProfileModal(true)}
              className="w-full p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <i className="bi bi-person text-xl"></i>
              <span className="sr-only">Perfil</span>
            </button>
            <button
              onClick={() => actions.toggleTheme()}
              className="w-full p-3 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg"
            >
              <i className="bi bi-palette text-xl"></i>
              <span className="sr-only">Cambiar Tema</span>
            </button>
            <button
              onClick={() => actions.logout()}
              className="w-full p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <i className="bi bi-box-arrow-left text-xl"></i>
              <span className="sr-only">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
      <TiendaSelectionModal
        isOpen={showTiendaModal}
        onClose={() => setShowTiendaModal(false)}
      />
      <UserProfileModal
        isOpen={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
        usuario={store.usuariofirmado}
      />
    </>
  );
};

export default Asidebar;