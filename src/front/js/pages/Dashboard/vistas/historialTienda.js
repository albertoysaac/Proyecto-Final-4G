import React, { useEffect, useState, useContext } from "react";
import { Context } from "../../../store/appContext";
import HistorialLogs from "../componentes/historialLogs";
import HistorialVentasCompras from "../componentes/historialVentasCompras";
import HistorialInventario from "../componentes/historialInventario";
import HistorialCaja from "../componentes/historialCaja";

const HistorialTienda = () => {
const { store, actions } = useContext(Context);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
const tiendaId = store.authdata.autoridades.id;

useEffect(() => {
    console.log("Obteniendo historial de la tienda...");
    console.log(store.authdata?.autoridades?.id);
    const loadData = async () => {
	try {
        if (tiendaId !== undefined) {
			await actions.getHistorialLogs(tiendaId);
			await actions.getHistorialVentasCompras(tiendaId);
			await actions.getHistorialInventario(tiendaId);
			await actions.getHistorialCaja(tiendaId);
			setIsLoading(false);
        }
	} catch (error) {
        setError("Error al cargar los datos: " + error.message);
        setIsLoading(false);
	}
    };
    loadData();
}, []);

if (isLoading) {
    return (
	<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
	</div>
    );
}

if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
}

return (
    <div className="space-y-6">
		<HistorialLogs logs={store.historial.logs} />
		<HistorialVentasCompras
			ventas={store.historial.ventas}
			compras={store.historial.compras}
		/>
		<HistorialInventario inventario={store.historial.inventario} />
		<HistorialCaja caja={store.historial.caja} />
    </div>
);
};

export default HistorialTienda;