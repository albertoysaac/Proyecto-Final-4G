import React, { useEffect, useContext, useState } from "react";
import { Context } from "../../../store/appContext";
import { TablaUsuarios } from "../componentes/tablaUsuarios";
import { ModalUsuario } from "../componentes/modal/modalUsuario";

export const Usuarios = () => {
	const { store, actions } = useContext(Context);
	const [showModal, setShowModal] = useState(false);
	const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
	const [usuarios, setUsuarios] = useState([]);
	const ceo = store.authdata?.autoridades?.rol === "ceo";
	const tiendaId = store.authdata?.autoridades?.id || "";

	useEffect(() => {
	console.log("Obteniendo usuarios de la tienda...");
	const loadUsuarios = async () => {
		if (tiendaId) {
		const response = await actions.getUsuariosTienda();
		if (response) {
			setUsuarios(response);
			console.log("Usuarios", response);
		}
		}
	};
	loadUsuarios();
	}, [tiendaId]);

	const handleEdit = async (usuario) => {
	if(usuario.nombre){
		setUsuarioSeleccionado(usuario);
		setShowModal(true);
	}else {
		setUsuarioSeleccionado(null);
		setShowModal(false);
	}
	};

	const handleSave = async (usuario) => {
	if (usuarios.find((u) => u.email === usuario.email)) {
		const status = await actions.editar3ro(usuario)
		if(status){
			setUsuarios(usuarios.map((u) => (u.email === usuario.email ? usuario : u)));
			setShowModal(false);
		}
	} else {
		let nuevoUsuario = {
			email: usuario.email,
			contraseña: usuario.contraseña,
			nombre: usuario.nombre,
			apellido: usuario.apellido,
			fecha_contratacion: usuario.fecha_contratacion,
			hora_entrada: usuario.hora_entrada,
			hora_salida: usuario.hora_salida,
			rol: usuario.rol,
			tienda_id: store.areaDeTrabajo.id,
		};
		if(await actions.crearUsuario(nuevoUsuario)){
			
			setUsuarios([...usuarios, nuevoUsuario]);
			setShowModal(false);
		}
	}
	};

	const handleDelete = async (usuario) => {
	const aEliminar = {
		id: usuario.id,
		tienda_id: usuario.autoridades[0].id,
	};
	if(await actions.eliminarUsuario(aEliminar)){
		setUsuarios(usuarios.filter((u) => u.email !== usuario.email));
		setShowModal(false);
	}
	else {
		console.error("Error al eliminar el usuario");
	}
	};


	return (
	<div className="space-y-8">
		<div className="flex justify-between items-center">
		<div>
			<h1 className="text-2xl font-bold text-gray-800 dark:text-white">
			Gestión de Usuarios
			</h1>
			<p className="text-gray-600 dark:text-gray-400">
			{store.authdata?.autoridades?.nombre}
			</p>
		</div>
		<div className="flex items-center space-x-4">
			<div className="flex items-center space-x-2 text-sm text-gray-600">
			<span className="px-3 py-1 rounded-full bg-green-100 text-green-800">
				{usuarios.length} Usuarios Activos
			</span>
			</div>
			<button
			onClick={() => setShowModal(true)}
			className="px-4 py-2 bg-lime-600 hover:bg-lime-700 
									text-white rounded-lg transition-colors"
			>
			<i className="bi bi-plus-lg mr-2"></i>
			Nuevo Usuario
			</button>
		</div>
		</div>

		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
		<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
			<thead className="bg-gray-50 dark:bg-gray-700">
			<tr>
				<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
				Usuario
				</th>
				<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
				Roles y Permisos
				</th>
				<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
				Información Laboral
				</th>
				<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
				Estado
				</th>
				<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
				Acciones
				</th>
			</tr>
			</thead>
			<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
			{usuarios.length > 0 ? (
				usuarios.map((usuario) => (
				<TablaUsuarios
					key={usuario.email}
					usuario={usuario}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
				))
			) : (
				<tr>
				<td colSpan="5" className="px-6 py-4 text-center text-gray-500">
					No hay usuarios registrados
				</td>
				</tr>
			)}
			</tbody>
		</table>
		</div>

		{showModal && (
		<ModalUsuario
			usuario={usuarioSeleccionado}
			onClose={() => setShowModal(false)}
			onSave={handleSave}
			tiendaId={store.areaDeTrabajo.id}
		/>
		)}
	</div>
	);
};
