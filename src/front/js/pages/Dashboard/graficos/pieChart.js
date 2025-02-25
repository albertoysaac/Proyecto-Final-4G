import React from "react";
import { Pie, PieChart, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { colors } from "./config";

export const Piechart = ({ data, title, subtitle }) => {
  const COLORS = [
    colors.primary,
    colors.secondary,
    colors.success,
    colors.warning,
    colors.danger,
  ];

  return (
    <div className="w-full h-[300px] p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      {data && data.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="valor"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={colors.primary}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">
                  {item.nombre}: {item.valor}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      )}
    </div>
  );
};
