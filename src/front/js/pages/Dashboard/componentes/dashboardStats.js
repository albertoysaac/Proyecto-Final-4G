import React, { useEffect, useContext } from 'react';
import { Context } from '../../../store/appContext';
import { StatsCard } from './statsCard';

export const DashboardStats = ({ isLoading }) => {
    const { store } = useContext(Context);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
                title="Ventas del Día"
                value={`$${store.dashboard?.stats?.ventas_dia || 0}`}
                icon="bi-cash"
                isLoading={isLoading}
            />
            <StatsCard
                title="Productos Bajos"
                value={store.dashboard?.stats?.productos_bajo_stock || 0}
                icon="bi-exclamation-triangle"
                isLoading={isLoading}
            />
            <StatsCard
                title="Total Productos"
                value={store.dashboard?.stats?.total_productos || 0}
                icon="bi-box-seam"
                isLoading={isLoading}
            />
            <StatsCard
                title="Últimos Tickets"
                value={store.dashboard?.stats?.ultimos_tickets?.length || 0}
                icon="bi-receipt"
                isLoading={isLoading}
            />
        </div>
    );
};