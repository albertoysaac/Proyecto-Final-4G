import React from "react";

const HistorialLogs = ({ logs = [] }) => {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
		<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
			Historial de Inicio de Sesión
		</h3>
		<ul className="space-y-2">
			{console.log(logs)}
			{logs.historial_usuarios.map((log, index) => (
			<li
				key={index}
				className="p-4 border rounded-lg flex justify-between items-center"
				style={{
				backgroundColor: log.tipo === "login" ? "#e0f7fa" : "#ffebee",
				}}
			>
				<span>{log.usuario.email}</span>
				<span>{log.ultimo_login}</span>
				<span>{log.ip}</span>
				<span>{log.rol}</span>
			</li>
			))}
		</ul>
		</div>
	);
};

export default HistorialLogs;