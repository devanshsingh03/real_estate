import { useMemo } from 'react';
import type { LayoutPlot } from '../../hooks/useLayoutPlots';

const statusColor: Record<string, string> = {
  available: '#A8B8A0',
  reserved: '#D7C5A3',
  sold: '#9c9c9c',
};

export default function PlotScene2D({
  plots,
  onSelect,
  selectedId,
}: {
  plots: LayoutPlot[];
  onSelect: (plot: LayoutPlot) => void;
  selectedId: number | null;
}) {
  const bounds = useMemo(() => {
    const maxX = Math.max(...plots.map((p) => p.layout_x + p.layout_w), 10) + 4;
    const maxY = Math.max(...plots.map((p) => p.layout_y + p.layout_d), 10) + 4;
    return { maxX, maxY };
  }, [plots]);

  return (
    <svg viewBox={`0 0 ${bounds.maxX} ${bounds.maxY}`} className="h-full w-full rounded-2xl bg-[#c9c2ab]">
      {plots.map((plot) => (
        <g key={plot.id} onClick={() => onSelect(plot)} className="cursor-pointer">
          <rect
            x={plot.layout_x}
            y={plot.layout_y}
            width={plot.layout_w}
            height={plot.layout_d}
            fill={statusColor[plot.status]}
            stroke={selectedId === plot.id ? '#102B25' : '#171C1A33'}
            strokeWidth={selectedId === plot.id ? 0.3 : 0.08}
            rx={0.3}
          />
          <text
            x={plot.layout_x + plot.layout_w / 2}
            y={plot.layout_y + plot.layout_d / 2}
            fontSize={1.1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#171C1A"
          >
            {plot.plot_number}
          </text>
        </g>
      ))}
    </svg>
  );
}
