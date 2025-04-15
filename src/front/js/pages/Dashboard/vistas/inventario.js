import React, { useEffect, useState, useContext } from "react";
import { Context } from "../../../store/appContext";
import {TablaInventario} from "../componentes/tablaInventario";

const Inventario = () => {
const { store, actions } = useContext(Context);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
    console.log("Obteniendo inventario de la tienda...");
    const loadData = async () => {
    	try {
			const tiendaId = store.authdata?.autoridades?.id;
			if (tiendaId) {
				await actions.getInventarioTienda(tiendaId);
			}
			setIsLoading(false);
		} catch (error) {
			setError("Error al cargar los datos: " + error.message);
			setIsLoading(false);
    	}
    };
    loadData();
}, [store.authdata?.autoridades?.id]);

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
    	<TablaInventario inventario={store.inventario} />
    </div>
);
};


export default Inventario;