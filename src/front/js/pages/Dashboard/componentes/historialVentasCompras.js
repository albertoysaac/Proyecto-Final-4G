import React from "react";

const HistorialVentasCompras = ({ ventas = [], compras = [] }) => {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
				Historial de Ventas y Compras
			</h3>
			<ul className="space-y-2">
				{console.log(ventas, compras)}
				{ventas.length === 0 && compras.length === 0 ? (
				<li className="p-4 border rounded-lg text-center text-gray-500">
					No hay registros de ventas o compras
				</li>
				) : (
				<>
					{ventas.map((venta, index) => (
					<li
						key={index}
						className="p-4 border rounded-lg flex justify-between items-center"
						style={{ backgroundColor: "#e8f5e9" }}
					>	
						{console.log(venta)}
						<span>{venta.id}</span>
						<span>{venta.fecha}</span>
						<span>{venta.total} / {venta.metodo_pago}</span>
						<span>{venta.vendedor.nombre} {venta.vendedor.apellido}</span>
						<span>{venta.estado}</span>
						<span>{venta.tipo_comprobante}</span>
					</li>
					))}
					{compras.map((compra, index) => (
					<li
						key={index}
						className="p-4 border rounded-lg flex justify-between items-center"
						style={{ backgroundColor: "#fff3e0" }}
					>
						<span>{compra.id}</span>
						<span>{compra.fecha}</span>
						<span><strong className="text-red-300">{`-${compra.total}`} </strong> / {compra.metodo_pago}</span>
						<span>{compra.vendedor.nombre} {compra.vendedor.apellido}</span>
						<span>{compra.estado}</span>
						<span>{compra.tipo_comprobante}</span>
						
					</li>
					))}
				</>
				)}
			</ul>
		</div>
	);
};

export default HistorialVentasCompras;