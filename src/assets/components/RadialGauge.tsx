import { RadialBar, RadialBarChart, PolarAngleAxis } from 'recharts';
import type { ReactNode } from 'react';

interface RadialGaugeProps {
  /** 0-100 */
  value: number;
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
  className?: string;
  label?: string;
  children?: ReactNode;
}

/**
 * Shared circular confidence/progress gauge (Recharts RadialBarChart under the hood).
 * Used anywhere the app shows an AI confidence or resolution-rate score as a ring,
 * so the three places that need one (Forense, DetallesCaso, NuevoReclamo) stay visually identical.
 */
const RadialGauge = ({
  value,
  size = 64,
  thickness = 6,
  color = 'var(--color-gold-400)',
  trackColor = 'rgba(255,255,255,0.12)',
  className,
  label,
  children,
}: RadialGaugeProps) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  const radius = (size - thickness) / 2;

  return (
    <div
      className={`relative shrink-0 ${className ?? ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(clamped)}%`}
    >
      <RadialBarChart
        width={size}
        height={size}
        cx="50%"
        cy="50%"
        innerRadius={radius}
        outerRadius={radius}
        barSize={thickness}
        data={[{ value: clamped }]}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
        <RadialBar
          dataKey="value"
          background={{ fill: trackColor }}
          fill={color}
          cornerRadius={thickness / 2}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </RadialBarChart>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};

export default RadialGauge;
