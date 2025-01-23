import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../img/hurricane.svg";

export const Nav = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full bg-white/80 dark:bg-gray-900/80 
                    backdrop-blur-sm shadow-md z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <img src={logo} alt="Logo" className="h-8 w-8" />
                        <span className="text-xl font-bold text-lime-600 
                                     dark:text-lime-500">
                            CRMiTiendita
                        </span>
                    </Link>

                    {/* Menú Desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 dark:text-gray-200 
                                            hover:text-lime-600 dark:hover:text-lime-500 
                                            transition-colors">
                            Inicio
                        </Link>
                        <Link to="/features" className="text-gray-700 dark:text-gray-200 
                                                   hover:text-lime-600 dark:hover:text-lime-500 
                                                   transition-colors">
                            Características
                        </Link>
                        <Link to="/pricing" className="text-gray-700 dark:text-gray-200 
                                                  hover:text-lime-600 dark:hover:text-lime-500 
                                                  transition-colors">
                            Precios
                        </Link>
                        <Link to="/authPortal" className="px-4 py-2 bg-lime-600 
                                                     hover:bg-lime-700 text-white 
                                                     rounded-lg transition-colors">
                            Iniciar Sesión
                        </Link>
                    </div>

                    {/* Botón Menú Mobile */}
                    <button onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-gray-700 dark:text-gray-200 
                                     hover:text-lime-600 dark:hover:text-lime-500">
                        <svg className="w-6 h-6" fill="none" strokeLinecap="round" 
                             strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" 
                             stroke="currentColor">
                            {isOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Menú Mobile */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'h-48 opacity-100' : 'h-0 opacity-0'
                } overflow-hidden`}>
                    <div className="py-2 space-y-2">
                        <Link to="/" className="block px-4 py-2 text-gray-700 
                                            dark:text-gray-200 hover:bg-gray-100 
                                            dark:hover:bg-gray-800">
                            Inicio
                        </Link>
                        <Link to="/features" className="block px-4 py-2 text-gray-700 
                                                   dark:text-gray-200 hover:bg-gray-100 
                                                   dark:hover:bg-gray-800">
                            Características
                        </Link>
                        <Link to="/pricing" className="block px-4 py-2 text-gray-700 
                                                  dark:text-gray-200 hover:bg-gray-100 
                                                  dark:hover:bg-gray-800">
                            Precios
                        </Link>
                        <Link to="/authPortal" className="block px-4 py-2 text-white 
                                                     bg-lime-600 hover:bg-lime-700 
                                                     rounded-lg">
                            Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};