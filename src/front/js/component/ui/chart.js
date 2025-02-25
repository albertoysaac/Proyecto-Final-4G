"use client"

import React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "../../utils/cn";

// Temas disponibles
const THEMES = { light: "", dark: ".dark" };

// Creamos el contexto para el gráfico
const ChartContext = React.createContext(null);

// Hook personalizado para usar el contexto
function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart debe ser usado dentro de <ChartContainer />");
  }
  return context;
}

// Componente contenedor principal
const ChartContainer = React.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});

// Componente para los estilos del gráfico
const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, prefix]) => `
            ${prefix} [data-chart=${id}] {
              ${colorConfig
                .map(([key, itemConfig]) => {
                  const color = itemConfig.theme?.[theme] || itemConfig.color;
                  return color ? `--color-${key}: ${color};` : null;
                })
                .filter(Boolean)
                .join("\n")}
            }
          `)
          .join("\n"),
      }}
    />
  );
};

// Componente para el tooltip
const ChartTooltipContent = React.forwardRef(({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  label,
  formatter
}, ref) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      ref={ref}
      className="min-w-[8rem] rounded-lg border bg-white p-2 shadow-lg"
    >
      {!hideLabel && label && (
        <div className="font-medium">{label}</div>
      )}
      <div className="grid gap-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// Nombres de visualización para los componentes
ChartContainer.displayName = "ChartContainer";
ChartTooltipContent.displayName = "ChartTooltipContent";

// Exportaciones
export {
  ChartContainer,
  ChartTooltipContent,
  useChart
};
