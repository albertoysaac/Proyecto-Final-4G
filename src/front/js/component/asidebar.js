import React, { useState } from "react";
import { Link } from "react-router-dom";

export const Asidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <aside 
            className={`fixed left-0 top-0 h-screen 
                       backdrop-blur-md bg-lime-600/65 dark:bg-green-900/65
                       transition-all duration-300 ease-in-out
                       border-r border-white/10
                       ${isExpanded ? 'w-64' : 'w-16'}
                       flex flex-col
                       shadow-[4px_0_15px_rgba(0,0,0,0.1)]`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="p-4">
                <i className="bi bi-justify text-2xl text-stone-900/50 cursor-pointer"></i>
            </div>

            <nav className="flex-1 overflow-y-auto">
                <ul className="space-y-2 py-4">
                    <li>
                        <Link to="/dashboard" 
                              className="flex items-center px-4 py-3  text-stone-900/50
                                       hover:bg-lime-400/70 transition-colors
                                       group">
                            <i className="bi bi-house-fill text-xl"></i>
                            <span className={`ml-4 transition-opacity duration-300
                                         ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                Inicio
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/perfil" 
                              className="flex items-center px-4 py-3  text-stone-900/50
                                       hover:bg-lime-400/70 transition-colors
                                       group">
                            <i className="bi bi-people-fill text-xl"></i>
                            <span className={`ml-4 transition-opacity duration-300
                                         ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                Usuarios
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/ventas" 
                              className="flex items-center px-4 py-3  text-stone-900/50
                                       hover:bg-lime-400/70 transition-colors
                                       group">
                            <i className="bi bi-cart4 text-xl"></i>
                            <span className={`ml-4 transition-opacity duration-300
                                         ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                Ventas
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/inventario" 
                              className="flex items-center px-4 py-3  text-stone-900/50
                                       hover:bg-lime-400/70 transition-colors
                                       group">
                            <i className="bi bi-box-seam text-xl"></i>
                            <span className={`ml-4 transition-opacity duration-300
                                         ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                Inventario
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/reportes" 
                              className="flex items-center px-4 py-3  text-stone-900/50
                                       hover:bg-lime-400/70 transition-colors
                                       group">
                            <i className="bi bi-graph-up text-xl"></i>
                            <span className={`ml-4 transition-opacity duration-300
                                         ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                Reportes
                            </span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="p-4 mt-auto">
                <Link to="/logout" 
                      className="flex items-center px-4 py-3  text-stone-900/50
                               hover:bg-lime-400/70 transition-colors
                               group">
                    <i className="bi bi-box-arrow-left text-xl"></i>
                    <span className={`ml-4 transition-opacity duration-300
                                 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                        Cerrar Sesión
                    </span>
                </Link>
            </div>
        </aside>
    );
};
