"use client";

import { useMemo, useState } from "react";

export function TrendChart({
  values,
  labels,
  onPointClick,
}: {
  values: number[];
  labels: string[];
  onPointClick?: (index: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const width = 760;
  const height = 260;
  const padding = 24;
  const max = Math.max(...values) * 1.08;
  const min = Math.min(...values) * 0.82;
  const points = useMemo(
    () =>
      values.map((value, index) => {
        const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
        return { x, y, value };
      }),
    [values, max, min],
  );
  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const area = `${path} L ${points.at(-1)?.x ?? 0} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="MCP 调用次数趋势">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c6df2" stopOpacity=".36" />
            <stop offset="100%" stopColor="#7c6df2" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1={padding}
            x2={width - padding}
            y1={padding + line * ((height - padding * 2) / 3)}
            y2={padding + line * ((height - padding * 2) / 3)}
            className="grid-line"
          />
        ))}
        <path d={area} fill="url(#trendFill)" />
        <path d={path} className="trend-line" />
        {points.map((point, index) => (
          <g
            key={`${point.x}-${point.y}`}
            className="chart-point"
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onPointClick?.(index)}
            role={onPointClick ? "button" : undefined}
          >
            <circle cx={point.x} cy={point.y} r="12" className="point-hit" />
            <circle cx={point.x} cy={point.y} r={hovered === index ? 5 : 3} className="point-dot" />
          </g>
        ))}
      </svg>
      {hovered !== null && (
        <div
          className="chart-tooltip"
          style={{
            left: `${(points[hovered].x / width) * 100}%`,
            top: `${(points[hovered].y / height) * 100}%`,
          }}
        >
          <span>{labels[hovered]}</span>
          <strong>{points[hovered].value.toLocaleString()} 次</strong>
          <small>成功率 {(98.1 + (hovered % 5) * 0.27).toFixed(2)}%</small>
        </div>
      )}
    </div>
  );
}

export function MiniBars({
  values,
  color = "purple",
}: {
  values: number[];
  color?: "purple" | "blue" | "amber" | "red";
}) {
  const max = Math.max(...values);
  return (
    <div className={`mini-bars bars-${color}`} aria-label="迷你趋势图">
      {values.map((value, index) => (
        <i
          key={`${value}-${index}`}
          style={{ height: `${Math.max(16, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function DistributionDonut({
  segments,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  const total = segments.reduce((sum, item) => sum + item.value, 0);
  const gradient = segments.reduce(
    (result, segment) => {
      const start = result.cursor;
      const end = start + (segment.value / total) * 100;
      result.stops.push(`${segment.color} ${start}% ${end}%`);
      result.cursor = end;
      return result;
    },
    { cursor: 0, stops: [] as string[] },
  ).stops.join(", ");
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${gradient})` }}>
        <div>
          <strong>{total}</strong>
          <span>全部调用</span>
        </div>
      </div>
      <div className="donut-legend">
        {segments.map((segment) => (
          <div key={segment.label}>
            <i style={{ background: segment.color }} />
            <span>{segment.label}</span>
            <strong>{segment.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
