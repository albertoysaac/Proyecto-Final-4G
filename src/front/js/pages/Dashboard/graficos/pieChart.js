import React from "react";
import { Pie, PieChart, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { colors as defaultColors } from "./config";

export const Piechart = ({ data, title, subtitle, colors }) => {
  // Usar los colores pasados como prop o los predeterminados
  const COLORS = colors || [
    defaultColors.primary,
    defaultColors.secondary,
    defaultColors.success,
    defaultColors.warning,
    defaultColors.danger,
  ];

  return (
    <div className="w-full h-[300px] p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
      {data && data.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height="70%">
            <PieChart>
              <Pie
                data={data}
                dataKey="valor"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={defaultColors.primary}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {item.nombre}: ${item.valor.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default Piechart;