import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Context } from "../store/appContext";
import { Suspense } from "react";
import Login from "../component/login";
import Register from "../component/register";

const AuthPortal = () => {
    const { store, actions } = useContext(Context);
    const location = useLocation();
    const { login } = location.state || { login: true };
    const [showLogin, setShowLogin] = useState(login);

    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800">
                {/* Contenedor izquierdo */}
                <div className="relative w-2/5 bg-lime-600 dark:bg-green-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] shadow-black/50 dark:shadow-black/70 z-10 transform -skew-x-3 rounded-r-3xl overflow-hidden border-r-4 border-lime-700/50">
                    <div className="flex justify-between items-center p-6">
                        <div className="flex items-center space-x-2">
                            <i className="bi bi-boxes text-3xl bg-yellow-600 dark:bg-yellow-900 p-2 rounded-lg"></i>
                            <span className="text-2xl font-bold text-white">CRMiTiendita</span>
                        </div>
                        <Link to="/" className="flex items-center text-white hover:text-yellow-200 transition-colors">
                            <i className="bi bi-arrow-left mr-2"></i>
                            Regresar
                        </Link>
                    </div>
                </div>

                {/* Contenedor derecho */}
                <div className="flex-1 bg-white dark:bg-gray-900 p-8 shadow-[inset_15px_0_15px_-15px_rgba(0,0,0,0.5)] dark:shadow-[inset_15px_0_15px_-15px_rgba(0,0,0,0.7)] -ml-10">
                    <div className="max-w-md mx-auto mt-10">
                        <div className="flex justify-center space-x-4 mb-8">
                            <button
                                className={`px-6 py-2 rounded-lg transition-all ${
                                    showLogin ? "bg-lime-600 text-white shadow-lg" : "bg-gray-200 text-gray-700"
                                }`}
                                onClick={() => setShowLogin(true)}
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                className={`px-6 py-2 rounded-lg transition-all ${
                                    !showLogin ? "bg-lime-600 text-white shadow-lg" : "bg-gray-200 text-gray-700"
                                }`}
                                onClick={() => setShowLogin(false)}
                            >
                                Registrarse
                            </button>
                        </div>
                        {showLogin ? <Login /> : <Register />}
                    </div>
                </div>
            </div>
        </Suspense>
    );
};

export default AuthPortal;