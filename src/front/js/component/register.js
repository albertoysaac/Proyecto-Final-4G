import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
	const { actions } = useContext(Context);
    
    // Datos tienda
    const [tiendaData, setTiendaData] = useState({
        nombre: '',
        direccion: '',
        hora_apertura: '',
        hora_cierre: ''
    });

    // Datos usuario
    const [userData, setUserData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        contraseña: '',
        fecha_contratacion: new Date().toISOString().split('T')[0],
        hora_entrada: '',
        hora_salida: ''
    });

    const handleTiendaChange = (e) => {
        setTiendaData({
            ...tiendaData,
            [e.target.name]: e.target.value
        });
    };

    const handleUserChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const status = await actions.registro({
                tienda: tiendaData,
                usuario: userData
            });
            if (status) {
                navigate('/dashboard/inicio');
            } else {
                console.log("Registro fallido", status, tiendaData, userData);
            }
        }
        catch(error){
            console.error("Error during register:", error);
        }
		
    };

    return (
        <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 
                      rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                      border border-gray-200/20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 
                       text-center">Registro Inicial</h2>
            
            {/* Indicador de pasos */}
            <div className="flex items-center justify-center mb-8">
                <div className={`w-4 h-4 rounded-full ${
                    step === 1 ? 'bg-lime-600' : 'bg-gray-300'
                } transition-colors duration-300`}></div>
                <div className={`w-16 h-1 ${
                    step === 2 ? 'bg-lime-600' : 'bg-gray-300'
                } transition-colors duration-300`}></div>
                <div className={`w-4 h-4 rounded-full ${
                    step === 2 ? 'bg-lime-600' : 'bg-gray-300'
                } transition-colors duration-300`}></div>
            </div>

            <div className="relative">
                {/* Formulario Tienda */}
                <div className={`transition-all duration-500 transform ${
                    step === 1 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute'
                }`}>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                        Paso 1: Datos de la Tienda
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Nombre
                                </label>
                                <input 
                                    type="text"
                                    name="nombre"
                                    value={tiendaData.nombre}
                                    onChange={handleTiendaChange}
                                    className="w-full px-4 py-2 rounded-lg border 
                                             border-gray-300 dark:border-gray-600
                                             bg-white/50 dark:bg-gray-800/50
                                             focus:ring-2 focus:ring-lime-500 
                                             focus:border-lime-500
                                             dark:text-white
                                             placeholder-gray-400
                                             backdrop-blur-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Dirección
                                </label>
                                <input 
                                    type="text"
                                    name="direccion"
                                    value={tiendaData.direccion}
                                    onChange={handleTiendaChange}
                                    className="w-full px-4 py-2 rounded-lg border 
                                             border-gray-300 dark:border-gray-600
                                             bg-white/50 dark:bg-gray-800/50
                                             focus:ring-2 focus:ring-lime-500 
                                             focus:border-lime-500
                                             dark:text-white
                                             placeholder-gray-400
                                             backdrop-blur-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Hora Apertura
                                    </label>
                                    <input 
                                        type="time"
                                        name="hora_apertura"
                                        value={tiendaData.hora_apertura}
                                        onChange={handleTiendaChange}
                                        className="w-full px-4 py-2 rounded-lg border 
                                                 border-gray-300 dark:border-gray-600
                                                 bg-white/50 dark:bg-gray-800/50
                                                 focus:ring-2 focus:ring-lime-500 
                                                 focus:border-lime-500
                                                 dark:text-white
                                                 backdrop-blur-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Hora Cierre
                                    </label>
                                    <input 
                                        type="time"
                                        name="hora_cierre"
                                        value={tiendaData.hora_cierre}
                                        onChange={handleTiendaChange}
                                        className="w-full px-4 py-2 rounded-lg border 
                                                 border-gray-300 dark:border-gray-600
                                                 bg-white/50 dark:bg-gray-800/50
                                                 focus:ring-2 focus:ring-lime-500 
                                                 focus:border-lime-500
                                                 dark:text-white
                                                 backdrop-blur-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="w-full py-2 px-4 bg-lime-600 
                                     hover:bg-lime-700 text-white font-semibold 
                                     rounded-lg shadow-md hover:shadow-lg 
                                     transition duration-300 ease-in-out"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>

                {/* Formulario Usuario */}
                <div className={`transition-all duration-500 transform ${
                    step === 2 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute'
                }`}>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                        Paso 2: Datos del Administrador
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Nombre
                                </label>
                                <input 
                                    type="text"
                                    name="nombre"
                                    value={userData.nombre}
                                    onChange={handleUserChange}
                                    className="w-full px-4 py-2 rounded-lg border 
                                             border-gray-300 dark:border-gray-600
                                             bg-white/50 dark:bg-gray-800/50
                                             focus:ring-2 focus:ring-lime-500 
                                             focus:border-lime-500
                                             dark:text-white
                                             placeholder-gray-400
                                             backdrop-blur-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Apellido
                                </label>
                                <input 
                                    type="text"
                                    name="apellido"
                                    value={userData.apellido}
                                    onChange={handleUserChange}
                                    className="w-full px-4 py-2 rounded-lg border 
                                             border-gray-300 dark:border-gray-600
                                             bg-white/50 dark:bg-gray-800/50
                                             focus:ring-2 focus:ring-lime-500 
                                             focus:border-lime-500
                                             dark:text-white
                                             placeholder-gray-400
                                             backdrop-blur-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Email
                            </label>
                            <input 
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleUserChange}
                                className="w-full px-4 py-2 rounded-lg border 
                                         border-gray-300 dark:border-gray-600
                                         bg-white/50 dark:bg-gray-800/50
                                         focus:ring-2 focus:ring-lime-500 
                                         focus:border-lime-500
                                         dark:text-white
                                         placeholder-gray-400
                                         backdrop-blur-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Contraseña
                            </label>
                            <input 
                                type="password"
                                name="contraseña"
                                value={userData.contraseña}
                                onChange={handleUserChange}
                                className="w-full px-4 py-2 rounded-lg border 
                                         border-gray-300 dark:border-gray-600
                                         bg-white/50 dark:bg-gray-800/50
                                         focus:ring-2 focus:ring-lime-500 
                                         focus:border-lime-500
                                         dark:text-white
                                         placeholder-gray-400
                                         backdrop-blur-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Hora de Entrada
                                </label>
                                <input 
                                    type="time"
                                    name="hora_entrada"
                                    value={userData.hora_entrada}
                                    onChange={handleUserChange}
                                    className="w-full px-4 py-2 rounded-lg border 
                                             border-gray-300 dark:border-gray-600
                                             bg-white/50 dark:bg-gray-800/50
                                             focus:ring-2 focus:ring-lime-500 
                                             focus:border-lime-500
                                             dark:text-white
                                             backdrop-blur-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Hora de Salida
                                </label>
                                <input 
                                    type="time"
                                    name="hora_salida"
                                    value={userData.hora_salida}
                                    onChange={handleUserChange}
                                    className="w-full px-4 py-2 rounded-lg border 
                                             border-gray-300 dark:border-gray-600
                                             bg-white/50 dark:bg-gray-800/50
                                             focus:ring-2 focus:ring-lime-500 
                                             focus:border-lime-500
                                             dark:text-white
                                             backdrop-blur-sm"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-1/2 py-2 px-4 bg-gray-500 
                                         hover:bg-gray-600 text-white font-semibold 
                                         rounded-lg shadow-md hover:shadow-lg 
                                         transition duration-300 ease-in-out"
                            >
                                Atrás
                            </button>
                            <button
                                type="submit"
                                className="w-1/2 py-2 px-4 bg-lime-600 
                                         hover:bg-lime-700 text-white font-semibold 
                                         rounded-lg shadow-md hover:shadow-lg 
                                         transition duration-300 ease-in-out"
                            >
                                Registrar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;