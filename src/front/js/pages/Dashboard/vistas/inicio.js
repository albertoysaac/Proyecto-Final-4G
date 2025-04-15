import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../../store/appContext";
import { StatsCard } from "../componentes/statsCard";
import { RecentActivity } from "../componentes/recentActivity";
import { Piechart } from "../graficos/pieChart";
import { Areachart } from "../graficos/areaChart";

const Inicio = () => {
  const { store, actions } = useContext(Context);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const tiendaNombre = store.authdata?.autoridades?.nombre || "";
  const nombre = store.usuariofirmado?.nombre || "";
  const rol = store.usuariofirmado?.autoridades?.rol || "";
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (store.areaDeTrabajo.estadisticas && store?.areaDeTrabajo?.estadisticas) {
          setStats(store.areaDeTrabajo.estadisticas);
        }
        setIsLoading(false);
      } catch (error) {
        setError("Error al cargar los datos: " + error.message);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-lime-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-5xl text-red-500 mb-4">
          <i className="bi bi-exclamation-circle"></i>
        </div>
        <p className="text-xl font-semibold text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!store.authdata?.autoridades?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-6xl text-gray-400 mb-4">
          <i className="bi bi-shop"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No hay tienda seleccionada</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Por favor seleccione una tienda para continuar</p>
        <button 
          onClick={() => actions.showTiendaSelectionModal()} 
          className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
        >
          Seleccionar Tienda
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header con gradiente */}
      <header className="bg-gradient-to-r from-lime-700 to-lime-500 text-white p-6 rounded-lg shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-2 text-lime-100 mt-1">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{tiendaNombre}</span>
            <span>•</span>
            <span>Bienvenido, {nombre}</span>
            <span>•</span>
            <span className="capitalize">{rol}</span>
          </div>
        </div>
        <button 
          onClick={actions.toggleTheme} 
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          title={store.theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
        >
          {store.theme === "light" ? (
            <i className="bi bi-moon-stars text-xl"></i>
          ) : (
            <i className="bi bi-brightness-high text-xl"></i>
          )}
        </button>
      </header>

      {/* Stats Cards con colores diferenciados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Ventas Totales"
          value={stats?.ventas?.total?.toLocaleString() || "0"}
          prefix="$"
          icon="bi-cash-coin"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white"
        />
        <StatsCard
          title="Ticket Promedio"
          value={stats?.ventas?.ticket_promedio?.toLocaleString() || "0"}
          prefix="$"
          icon="bi-receipt"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        />
        <StatsCard
          title="Total Transacciones"
          value={stats?.ventas?.num_transacciones?.toLocaleString() || "0"}
          icon="bi-bag-check"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
        />
      </div>

      {/* Activity & Charts Grid mejorado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
            <h3 className="text-xl font-semibold">
              <i className="bi bi-activity mr-2"></i>
              Actividad Reciente
            </h3>
          </div>
          <div className="p-4">
            <RecentActivity
              tickets={stats?.ultimos_tickets || []}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white">
            <h3 className="text-xl font-semibold">
              <i className="bi bi-pie-chart mr-2"></i>
              Ventas por Categoría
            </h3>
          </div>
          <div className="p-4">
            {stats?.productos?.mas_vendidos?.length > 0 ? (
              <Piechart 
                data={stats.productos.mas_vendidos.map(producto => ({
                  nombre: producto.producto.nombre,
                  valor: producto.cantidad_vendida
                }))} 
                colors={['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <i className="bi bi-pie-chart text-4xl mb-3 opacity-50"></i>
                <p>No hay datos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráfica de Crecimiento de Ventas mejorada */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 text-white">
          <h3 className="text-xl font-semibold">
            <i className="bi bi-graph-up mr-2"></i>
            Crecimiento de Ventas
          </h3>
        </div>
        <div className="p-6">
          {stats?.estadisticas_diarias?.ventas?.crecimiento?.length > 0 ? (
            <Areachart
              data={stats.estadisticas_diarias.ventas.crecimiento.map(dato => ({
                date: dato.fecha,
                value: dato.total
              }))}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <i className="bi bi-graph-up text-4xl mb-3 opacity-50"></i>
              <p>No hay datos disponibles para mostrar el crecimiento</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Información adicional - Resumen del inventario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-4 text-white">
            <h3 className="text-xl font-semibold">
              <i className="bi bi-box-seam mr-2"></i>
              Resumen de Inventario
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border-l-4 border-amber-500">
                <p className="text-sm text-amber-700 dark:text-amber-300">Productos Bajo Stock</p>
                <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  {stats?.inventario?.productos_bajo_stock || "0"}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-green-700 dark:text-green-300">Total Productos</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {stats?.inventario?.total_productos || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 text-white">
            <h3 className="text-xl font-semibold">
              <i className="bi bi-calendar-check mr-2"></i>
              Resumen del Día
            </h3>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Ventas Hoy</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${stats?.ventas_dia || "0"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tickets Hoy</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats?.transacciones_dia || "0"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Fecha</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;