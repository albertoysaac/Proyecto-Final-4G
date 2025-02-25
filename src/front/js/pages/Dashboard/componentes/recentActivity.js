import React from 'react';

export const RecentActivity = ({ tickets, isLoading}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actividad Reciente
            </h3>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {tickets?.map((ticket) => (
                    <div key={ticket.id} className="py-3">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Ticket #{ticket.id}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {ticket.fecha}
                                </p>
                            </div>
                            <p className="text-sm font-semibold text-lime-600 dark:text-lime-400">
                                ${ticket.total}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};