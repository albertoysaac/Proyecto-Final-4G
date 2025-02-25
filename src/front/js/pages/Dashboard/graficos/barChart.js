import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { colors, commonConfig } from "./config";

export const Barchart = ({ data, title, subtitle }) => {
  return (
    <div className="w-full h-[300px] p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={commonConfig.margin}>
          <CartesianGrid {...commonConfig.gridConfig} />
          <XAxis {...commonConfig.axisConfig} dataKey="nombre" />
          <Tooltip />
          <Bar 
            dataKey="valor" 
            fill={colors.secondary}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
