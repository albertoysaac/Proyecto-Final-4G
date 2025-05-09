import React, { useContext, useEffect, useState ,Suspense} from "react";
import { Context } from "../../store/appContext";
import { Routes, Route } from "react-router-dom";

const Asidebar = React.lazy(() => import("../../component/asidebar"));
const TiendaSelectionModal = React.lazy(() => import("./componentes/tiendaSelectionModal"));
const Inicio = React.lazy(() => import("./vistas/inicio"));
const Usuarios = React.lazy(() => import("./vistas/usuarios"));
const Ventas = React.lazy(() => import("./vistas/ventas"));
const Inventario = React.lazy(() => import("./vistas/inventario"));
const HistorialTienda = React.lazy(() => import("./vistas/historialTienda"));
const GlobalStats = React.lazy(() => import("./vistas/globalStats"));
const ModalCaja = React.lazy(() => import("./componentes/modal/ModalCaja"));

const Dashboard = () => {
    const { store, actions } = useContext(Context);
    const [showModal, setShowModal] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showModalCaja, setShowModalCaja] = useState(false);
    const [cajaAbierta, setCajaAbierta] = useState(false);
    const CEO = store.authdata?.rol === "ceo"; // CEO con muchas tiendas
    const ceo = store.authdata?.autoridades?.rol === "ceo" || null; // CEO con una tienda
    const isAdmin = store.usuariofirmado?.autoridades?.rol === "administrador";

    useEffect(() => {
        console.log(CEO, ceo, isAdmin);
        const initDashboard = async () => {
            try {
                if (ceo || isAdmin) {
                    setShowModal(false);
                    setIsLoading(false);	
                } else if (CEO) {
                    setShowModal(true);
                    setIsLoading(false);
                }
            }catch (error) {
                console.error("Error al inicializar el dashboard:", error);
                setIsLoading(false);
            }
        };
        initDashboard();
    }, []);

    
    const caja = async () => {
        try{
            if (store?.areaDeTrabajo?.caja?.estado && store?.areaDeTrabajo?.caja?.estado === "cerrada") {
                setShowModalCaja(true);
                setCajaAbierta(false);
            } else if (store?.areaDeTrabajo?.caja?.estado && store?.areaDeTrabajo?.caja?.estado === "abierta") {
                setCajaAbierta(true);
            }
        }catch(error){
            console.error("error al verificar caja: ", error)
        }
    }

    const handleModalClose = () => {
        if (store.authdata?.autoridades.rol) {
            setShowModal(false);
            caja();
        }
    };

    const handleAbrirCaja = async (montoInicial) => {
        try {
            if (montoInicial <= 0) {
                alert("El monto inicial debe ser mayor que cero.");
                return;
            }
            await actions.abrirCaja({ tienda_id: store.areaDeTrabajo.tienda.id, monto_inicial: montoInicial });
            setShowModalCaja(false); // Ocultar modal
            setCajaAbierta(true); // Actualizar estado de la caja
        } catch (error) {
            console.error("Error al abrir caja:", error);
        }
    };

    const handleCerrarCaja = async (montoFinal) => {
        try {
            if (montoFinal <= 0) {
                alert("El monto final debe ser mayor que cero.");
                return;
            }
            await actions.cerrarCaja(store.caja.cajaActual.id, { monto_final: montoFinal });
            setShowModalCaja(false); // Ocultar modal
            setCajaAbierta(false); // Actualizar estado de la caja
        } catch (error) {
            console.error("Error al cerrar caja:", error);
        }
    };

    return (
        <Suspense fallback={<div>Cargando...</div>}>
            {CEO && (
                <TiendaSelectionModal isOpen={showModal} onClose={handleModalClose} />
            )}
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
                <Asidebar />
                <main className="flex-1 ml-16 p-8 transition-all duration-300 md:ml-64">
                    <Routes>
                        {(CEO || ceo) && (
                            <>
                                <Route path="/global" element={<GlobalStats />} />
                                <Route path="/inicio" element={<Inicio />} />
                                <Route path="/usuarios" element={<Usuarios />} />
                                <Route path="/ventas" element={<Ventas />} />
                                <Route path="/historial" element={<HistorialTienda />} />
                                <Route path="/inventario" element={<Inventario />} />
                            </>
                        )}
                        {isAdmin && (
                            <>
                                <Route path="/inicio" element={<Inicio />} />
                                <Route path="/usuarios" element={<Usuarios />} />
                                <Route path="/ventas" element={<Ventas />} />
                                <Route path="/historial" element={<HistorialTienda />} />
                                <Route path="/inventario" element={<Inventario />} />
                            </>
                        )}
                        {!CEO && !ceo && !isAdmin && (
                            <>
                                <Route path="/inicio" element={<Inicio />} />
                                <Route path="/ventas" element={<Ventas />} />
                                <Route path="/inventario" element={<Inventario />} />
                            </>
                        )}
                    </Routes>
                </main>
            </div>
            <ModalCaja
                isOpen={showModalCaja}
                onClose={() => setShowModalCaja(false)}
                onAbrirCaja={handleAbrirCaja}
                onCerrarCaja={handleCerrarCaja}
                cajaAbierta={cajaAbierta}
            />
        </Suspense>
    );
};

export default Dashboard;