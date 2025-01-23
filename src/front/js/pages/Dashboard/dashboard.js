import React, { useContext } from "react";
import { Context } from "../../store/appContext";
import { Asidebar } from "../../component/asidebar";

export const Dashboard = () => {
    const { store } = useContext(Context);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <div className="w-64">
                <Asidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Bienvenido, {store.usuariofirmado.nombre}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            Ventas Totales
                        </h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            $23,456
                        </p>
                    </div>
                    {/* Más stats cards aquí */}
                </div>

                {/* Recent Activity & Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Actividad Reciente
                        </h3>
                        {/* Lista de actividades */}
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Ventas por Categoría
                        </h3>
                        {/* Gráfico aquí */}
                    </div>
                </div>
            </div>
        </div>
    );
};
