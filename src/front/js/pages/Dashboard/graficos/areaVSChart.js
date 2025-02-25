import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { colors, commonConfig } from "./config";

export const AreaVSChart = ({ data, title, subtitle }) => {
  return (
    <div className="w-full h-[300px] p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={commonConfig.margin}>
          <CartesianGrid {...commonConfig.gridConfig} />
          <XAxis {...commonConfig.axisConfig} dataKey="fecha" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="ventas"
            stackId="1"
            stroke={colors.primary}
            fill={colors.primary}
            fillOpacity={0.4}
          />
          <Area
            type="monotone"
            dataKey="compras"
            stackId="1"
            stroke={colors.secondary}
            fill={colors.secondary}
            fillOpacity={0.4}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};