import React, { useEffect, useState, useContext } from "react";
import { Context } from "../../../store/appContext";
import { StatsCard } from "../componentes/statsCard";
import { Barchart } from "../graficos/barChart";
import { Piechart } from "../graficos/pieChart";

const GlobalStats = () => {
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
      <div className="p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-pulse">
            Dashboard Global
          </h1>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">
            Cargando estadísticas...
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(index => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse h-64"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse h-64"></div>
        </div>
      </div>
    );
  }

  // Verificar si tenemos datos antes de renderizar
  if (!stats) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-6xl text-gray-400 mb-4">
          <i className="bi bi-bar-chart-line"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No hay datos disponibles</h2>
        <p className="text-gray-600 mt-2">Aún no se han registrado estadísticas en el sistema</p>
      </div>
    );
  }

  const productosMasVendidos = stats?.productos?.mas_vendidos?.map(producto => ({
    nombre: producto.producto.nombre,
    valor: producto.cantidad_vendida,
    total: parseFloat(producto.total_vendido)
  })) || [];

  return (
    <div className="p-6 space-y-8">
      <header className="mb-8 bg-gradient-to-r from-lime-700 to-lime-500 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">Dashboard Global</h1>
        <p className="text-lime-100">
          Análisis completo de todas las tiendas
        </p>
      </header>

      {/* Tarjetas de resumen principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Ventas Totales"
          value={stats?.ventas?.total ? `$${stats.ventas.total.toLocaleString()}` : "$0"}
          icon="bi-cash-coin"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white"
        />
        <StatsCard
          title="Total Transacciones"
          value={stats?.ventas?.num_transacciones?.toLocaleString() || "0"}
          icon="bi-bag-check"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        />
        <StatsCard
          title="Productos Bajo Stock"
          value={stats?.inventario?.productos_bajo_stock || "0"}
          icon="bi-exclamation-triangle"
          trendType="danger"
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        />
        <StatsCard
          title="Total Productos"
          value={stats?.inventario?.total_productos || "0"}
          icon="bi-box-seam"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
        />
      </div>

      {/* Productos más vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2">
            <i className="bi bi-star mr-2 text-yellow-500"></i>
            Top Productos
          </h2>
          <div className="space-y-4">
            {productosMasVendidos.length > 0 ? (
              productosMasVendidos.map((producto, index) => (
                <div key={index} className="flex items-center border-b pb-2 last:border-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center font-bold mr-2">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-gray-900 dark:text-white">{producto.nombre}</p>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{producto.valor} unidades</span>
                      <span>${producto.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No hay productos vendidos para mostrar
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2">
            <i className="bi bi-bar-chart mr-2 text-blue-500"></i>
            Productos Más Vendidos
          </h2>
          <div className="h-[300px]">
            {productosMasVendidos.length > 0 ? (
              <Barchart 
                data={productosMasVendidos} 
                title="" 
                subtitle="Cantidad vendida" 
                colors={['#10B981', '#34D399', '#6EE7B7']}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No hay datos suficientes para mostrar la gráfica
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usuarios y Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Mejores Usuarios */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
            <h2 className="text-xl font-semibold">
              <i className="bi bi-people mr-2"></i>
              Mejores Usuarios
            </h2>
          </div>
          <div className="p-6">
            {stats?.usuarios && stats.usuarios.length > 0 ? (
              <div className="space-y-6">
                {stats.usuarios.map((usuario, index) => (
                  <div key={index} className="flex items-center border-b pb-4 last:border-0">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl mr-4">
                      <i className="bi bi-person"></i>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {usuario.usuario.nombre} {usuario.usuario.apellido}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {usuario.num_ventas} ventas realizadas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        ${usuario.total_ventas.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay datos de usuarios para mostrar
              </div>
            )}
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white">
            <h2 className="text-xl font-semibold">
              <i className="bi bi-wallet2 mr-2"></i>
              Balance
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <StatsCard
                title="Ingresos"
                value={`$${stats?.balance?.total_ingresos?.toLocaleString() || "0"}`}
                icon="bi-graph-up-arrow"
                className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500"
                valueColor="text-green-600"
              />
              <StatsCard
                title="Egresos"
                value={`$${stats?.balance?.total_egresos?.toLocaleString() || "0"}`}
                icon="bi-graph-down-arrow"
                className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500"
                valueColor="text-red-600"
              />
            </div>
            <div className="h-[250px] bg-white/50 dark:bg-gray-900/20 rounded-lg p-4">
				<Piechart
					title="Distribución de Ingresos vs Egresos"
					subtitle="Representación gráfica del flujo de efectivo"
					data={[
					{
						nombre: "Ingresos",
						valor: stats?.balance?.total_ingresos || 0,
					},
					{
						nombre: "Egresos",
						valor: stats?.balance?.total_egresos || 0,
					},
					]}
					colors={['#22c55e', '#ef4444']}
				/>
			</div>
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Balance Actual</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats?.balance?.balance?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalStats;
