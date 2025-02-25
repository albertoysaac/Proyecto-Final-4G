import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../../store/appContext";
import { DashboardStats } from "../componentes/dashboardStats";
import { RecentActivity } from "../componentes/recentActivity";
import { StatsCard } from "../componentes/statsCard";
import { Areachart, Piechart } from "../graficos";

export const Inicio = () => {
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
        setError("error al cargar los datos: " + error.message);
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

  if (!store.authdata?.autoridades?.id) {
    return (
      <div className="text-center p-4">
        Por favor seleccione una tienda para continuar
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Dashboard
          </h1>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <span>{tiendaNombre}</span>
            <span>•</span>
            <span>Bienvenido, {nombre}</span>
            <span>•</span>
            <span className="capitalize">{rol}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Ventas Totales"
            value={stats?.ventas?.total.toLocaleString() || 0}
            prefix="$"
            icon="bi-cash"
          />
          <StatsCard
            title="Ticket Promedio"
            value={stats?.ventas?.ticket_promedio?.toLocaleString() || 0}
            prefix="$"
            icon="bi-receipt"
          />
          <StatsCard
            title="Total Transacciones"
            value={stats?.ventas?.num_transacciones?.toLocaleString() || 0}
            icon="bi-bag"
          />
        </div>

        {/* Activity & Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivity
            tickets={stats?.ultimos_tickets || []}
            isLoading={isLoading}
          />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ventas por Categoría
            </h3>
            <Piechart data={stats?.productos?.mas_vendidos.map(producto => ({
              name: producto.producto.nombre,
              value: producto.cantidad_vendida
            })) || []} />
          </div>
        </div>

        {/* Gráfica de Crecimiento de Ventas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Crecimiento de Ventas
          </h3>
          <Areachart
            data={stats?.estadisticas_diarias?.ventas?.crecimiento.map(dato => ({
              date: dato.fecha,
              value: dato.total
            })) || []}
          />
        </div>
      </div>
    </div>
  );
};
