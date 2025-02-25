import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { colors, commonConfig } from "./config";

export const Areachart = ({ data, title, subtitle }) => {
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
              dataKey="valor"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };