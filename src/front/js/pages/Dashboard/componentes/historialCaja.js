import React from "react";

const HistorialCaja = ({ caja = [] }) => {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
		<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
			Historial de Caja
		</h3>
		<ul className="space-y-2">
			{console.log(caja)}
			{console.log(caja.historial_cajas[0])}
			{caja.historial_cajas[0].movimientos.map((movimiento, index) => (
			<li
				key={index}
				className="p-4 border rounded-lg flex justify-between items-center"
				style={{
				backgroundColor:
					movimiento.tipo === "entrada" ? "#e8f5e9" : "#ffebee",
				}}
			>	
				<span>{movimiento.fecha}</span>
				<span>{movimiento.tipo}</span>
				<span>{movimiento.monto}</span>
			</li>
			))}
		</ul>
		</div>
	);
};

export default HistorialCaja;