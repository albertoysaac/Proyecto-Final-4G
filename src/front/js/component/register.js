import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';

export const Register = () => {
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
        actions.nuevaTienda({
			tienda: tiendaData,
			usuario: userData
		});
		
    };

    return (
            <div className="row justify-content-center">
                <div className="card">
                    <div className="card-body">
                        <h2 className="text-center mb-5">Registro de Nueva Tienda</h2>
                        <h4 className='mb-2'>Paso 1: Datos de la Tienda</h4>
                        
                        {step === 1 ? (
                            <>
                                <form className='d-flex flex-column'>
                                    
                                    <div className="row mb-3">
                                        <label className="form-label">Nombre de la Tienda</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="nombre"
                                            value={tiendaData.nombre}
                                            onChange={handleTiendaChange}
                                            required
                                        />
                                    </div>
                                    <div className="row mb-3">
                                        <label className="form-label">Dirección</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="direccion"
                                            value={tiendaData.direccion}
                                            onChange={handleTiendaChange}
                                            required="required"
                                        />
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col">
                                            <label className="form-label">Hora de Apertura</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                name="hora_apertura"
                                                value={tiendaData.hora_apertura}
                                                onChange={handleTiendaChange}
                                                required
                                            />
                                        </div>
                                        <div className="col">
                                            <label className="form-label">Hora de Cierre</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                name="hora_cierre"
                                                value={tiendaData.hora_cierre}
                                                onChange={handleTiendaChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary w-100"
                                        onClick={() => setStep(2)}
                                    >
                                        Siguiente
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <h4>Paso 2: Datos del Administrador</h4>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Nombre</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="nombre"
                                            value={userData.nombre}
                                            onChange={handleUserChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Apellido</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="apellido"
                                            value={userData.apellido}
                                            onChange={handleUserChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={userData.email}
                                            onChange={handleUserChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="contraseña"
                                            value={userData.contraseña}
                                            onChange={handleUserChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Hora de Entrada</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="hora_entrada"
                                            value={userData.hora_entrada}
                                            onChange={handleUserChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Hora de Salida</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="hora_salida"
                                            value={userData.hora_salida}
                                            onChange={handleUserChange}
                                            required
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-secondary w-50"
                                            onClick={() => setStep(1)}
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-50"
                                        >
                                            Registrar
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
    );
};