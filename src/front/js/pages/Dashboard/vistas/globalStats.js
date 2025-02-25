import React, { useEffect, useState, useContext } from "react";
import { Context } from "../../../store/appContext";
import { Piechart, Barchart } from "../graficos";
import { StatsCard } from "../componentes/statsCard";

export const GlobalStats = () => {
  const { store, actions } = useContext(Context);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await actions.getGlobalStats();
        if (response) {
          setStats(response.estadisticas);
        }
      } catch (error) {
        console.error("Error al obtener estadísticas globales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Verificar si tenemos datos antes de renderizar
  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    );
  }

  const productosMasVendidos = stats?.productos?.mas_vendidos.map(producto => ({
    nombre: producto.producto.nombre,
    valor: producto.cantidad_vendida,
    total: parseFloat(producto.total_vendido)
  }));

  return (
    <div className="p-6 space-y-12">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Global
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Análisis completo de todas las tiendas
        </p>
      </header>

      <div className="space-y-12">
        {/* Sección Productos */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatsCard
            title="Productos Bajo Stock"
            value={`${stats?.inventario?.productos_bajo_stock}` || "SIN PRODUCTOS BAJOS"}
            icon="bi-exclamation-triangle"
            trendType="danger"
          />
          <StatsCard
            title="Total Productos"
            value={`${stats?.inventario?.total_productos}`}
            icon="bi-box"
          />
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {stats?.productos?.mas_vendidos.map((producto, index) => (
              <StatsCard
                key={index}
                title="Producto Más Vendido"
                value={producto.producto.nombre || "-"}
                subtitle={`${producto.cantidad_vendida.toLocaleString()} ventas`}
                icon="bi-star"
              />
            ))}
          </div>
          <div className="w-full">
            <Barchart 
              data={productosMasVendidos} 
              title="Productos Más Vendidos" 
              subtitle="Cantidad vendida" 
            />
          </div>
        </section>

        {/* Sección Usuarios */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow space-y-8">
          <h2 className="text-xl font-semibold p-6 border-b">
            Mejores Usuarios
          </h2>
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats?.usuarios?.map((usuario, index) => (
                <div key={index}>
                  <StatsCard
                    title={`${usuario.usuario.nombre} ${usuario.usuario.apellido}`}
                    value={`total vendido: $${usuario.total_ventas.toLocaleString()}`}
                    subtitle={`En ${usuario.num_ventas} ventas`}
                    icon="bi-person"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sección Ventas */}
        <section className="space-y-8">
          <div>
            <StatsCard
              title="Ventas Totales"
              value={`${stats?.ventas?.total.toLocaleString()}`}
              prefix="$"
              icon="bi-cash"
            />
          </div>
          <div>
            <StatsCard
              title="Total Transacciones"
              value={stats?.ventas?.num_transacciones?.toLocaleString()}
              icon="bi-bag"
            />
          </div>
        </section>

        {/* Sección Balance */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow space-y-8">
          <h2 className="text-xl font-semibold p-6 border-b">Balance</h2>
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatsCard
                title="Ingresos Totales"
                value={`${stats?.balance?.total_ingresos.toLocaleString()}`}
                prefix="$"
                icon="bi-arrow-down-circle"
              />
              <StatsCard
                title="Egresos Totales"
                value={`${stats?.balance?.total_egresos.toLocaleString()}`}
                prefix="$"
                icon="bi-arrow-up-circle"
              />
              <StatsCard
                title="Balance Actual"
                value={stats?.balance?.balance}
                prefix="$"
                icon="bi-wallet"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Piechart
                  data={[
                    {
                      nombre: "Ingresos",
                      valor: stats?.balance?.total_ingresos,
                    },
                    {
                      nombre: "Egresos",
                      valor: stats?.balance?.total_egresos,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
