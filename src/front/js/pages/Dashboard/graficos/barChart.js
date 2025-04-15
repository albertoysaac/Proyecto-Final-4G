import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { colors, commonConfig } from "./config";

export const Barchart = ({ data, title, subtitle, customColor }) => {
  return (
    <div className="w-full h-[300px] p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={commonConfig.margin}>
          <CartesianGrid {...commonConfig.gridConfig} stroke="#374151" strokeOpacity={0.1} />
          <XAxis 
            {...commonConfig.axisConfig} 
            dataKey="nombre" 
            tick={{ fill: '#6B7280' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderColor: '#E5E7EB',
              borderRadius: '0.375rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            formatter={(value) => [`${value}`, 'Cantidad']}
          />
          <Bar 
            dataKey="valor" 
            fill={customColor || colors.secondary}
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Barchart;
