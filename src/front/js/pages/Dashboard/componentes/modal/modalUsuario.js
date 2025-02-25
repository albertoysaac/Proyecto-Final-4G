import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const ModalUsuario = ({ usuario , onClose, onSave , tiendaId}) => {

    const [formData, setFormData] = useState({
        nombre: usuario?.nombre || '',
        apellido: usuario?.apellido || '',
        email: usuario?.email || '',
        contraseña: '',
        fecha_contratacion: new Date().toISOString().split('T')[0],
        rol: usuario?.rol || 'vendedor',
        hora_entrada: usuario?.hora_entrada || '09:00',
        hora_salida: usuario?.hora_salida || '18:00',
        tienda_id: tiendaId
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
				{usuario  == null || usuario == undefined ? (
					<>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Nombre
								</label>
								<input
									type="text"
									name="nombre"
									value={formData.nombre}
									onChange={(e) => setFormData({...formData, nombre: e.target.value})}
									className="mt-1 block w-full rounded-md border-gray-300 
											shadow-sm focus:border-lime-500 focus:ring-lime-500"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Apellido
								</label>
								<input
									type="text"
									name="apellido"
									value={formData.apellido}
									onChange={(e) => setFormData({...formData, apellido: e.target.value})}
									className="mt-1 block w-full rounded-md border-gray-300 
											shadow-sm focus:border-lime-500 focus:ring-lime-500"
									required
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Email
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={(e) => setFormData({...formData, email: e.target.value})}
								className="mt-1 block w-full rounded-md border-gray-300 
										shadow-sm focus:border-lime-500 focus:ring-lime-500"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Contraseña
							</label>
							<input
								type="password"
								name="contraseña"
								value={formData.contraseña}
								onChange={(e) => setFormData({...formData, contraseña: e.target.value})}
								className="mt-1 block w-full rounded-md border-gray-300 
										shadow-sm focus:border-lime-500 focus:ring-lime-500"
								required={!usuario}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Rol
							</label>
							<select
								name="rol"
								value={formData.rol}
								onChange={(e) => setFormData({...formData, rol: e.target.value})}
								className="mt-1 block w-full rounded-md border-gray-300 
										shadow-sm focus:border-lime-500 focus:ring-lime-500"
							>
								<option value="vendedor">Vendedor</option>
								<option value="admin">Administrador</option>
							</select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Hora Entrada
								</label>
								<input
									type="time"
									name="hora_entrada"
									value={formData.hora_entrada}
									onChange={(e) => setFormData({...formData, hora_entrada: e.target.value})}
									className="mt-1 block w-full rounded-md border-gray-300 
											shadow-sm focus:border-lime-500 focus:ring-lime-500"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Hora Salida
								</label>
								<input
									type="time"
									name="hora_salida"
									value={formData.hora_salida}
									onChange={(e) => setFormData({...formData, hora_salida: e.target.value})}
									className="mt-1 block w-full rounded-md border-gray-300 
											shadow-sm focus:border-lime-500 focus:ring-lime-500"
									required
								/>
							</div>
						</div>
					</>
				):(
					<>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Nombre
							</label>
							<input
								type="text"
								name="nombre"
								value={formData.nombre}
								onChange={(e) => setFormData({...formData, nombre: e.target.value})}
								className="mt-1 block w-full rounded-md border-gray-300 
										shadow-sm focus:border-lime-500 focus:ring-lime-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Apellido
							</label>
							<input
								type="text"
								name="apellido"
								value={formData.apellido}
								onChange={(e) => setFormData({...formData, apellido: e.target.value})}
								className="mt-1 block w-full rounded-md border-gray-300 
										shadow-sm focus:border-lime-500 focus:ring-lime-500"
								required
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Rol
						</label>
						<select
							name="rol"
							value={formData.rol}
							onChange={(e) => setFormData({...formData, rol: e.target.value})}
							className="mt-1 block w-full rounded-md border-gray-300 
									shadow-sm focus:border-lime-500 focus:ring-lime-500"
						>
							<option value="vendedor">Vendedor</option>
							<option value="admin">Administrador</option>
						</select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Hora Entrada
							</label>
							<input
								type="time"
								name="hora_entrada"
								value={formData.hora_entrada}
								onChange={(e) => setFormData({...formData, hora_entrada: e.target.value})}
								className="mt-1 block w-full rounded-md border-gray-300 
										shadow-sm focus:border-lime-500 focus:ring-lime-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Hora Salida
							</label>
							<input
								type="time"
								name="hora_salida"
								value={formData.hora_salida}
								onChange={(e) => setFormData({...formData, hora_salida: e.target.value})}
								className="mt-1 block w-full rounded-md border-gray-300 
										shadow-sm focus:border-lime-500 focus:ring-lime-500"
								required
							/>
						</div>
					</div>
					</>
				)}
                    

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md 
                                     text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-lime-600 text-white rounded-md 
                                     hover:bg-lime-700"
                        >
                            {usuario ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ModalUsuario.propTypes = {
    usuario: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
};