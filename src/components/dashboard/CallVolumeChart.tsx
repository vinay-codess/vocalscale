import React, { useState, useMemo } from 'react';

interface ChartDataPoint {
  day: string;
  calls: number;
  active: boolean;
}

interface CallVolumeChartProps {
  data: ChartDataPoint[];
}

const CallVolumeChart: React.FC<CallVolumeChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartWidth = 800;
  const chartHeight = 360;
  const paddingX = 35;
  const paddingY = 20;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 4; // More space at bottom for labels

  const chartData = useMemo(() => {
    // Determine max Y value for scaling
    const rawMax = Math.max(...data.map(d => d.calls), 1);
    const maxCalls = Math.ceil(rawMax * 1.15); 
    const minCalls = 0;
    const range = maxCalls - minCalls;

    const points = data.map((d, index) => {
      // X position: evenly spaced
      const x = paddingX + (index / (data.length - 1)) * graphWidth;
      
      // Y position
      const normalizedValue = range === 0 ? 0 : (d.calls - minCalls) / range;
      const y = paddingY + graphHeight - normalizedValue * graphHeight;
      
      return { x, y, ...d };
    });

    const linePath = points.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const prev = points[index - 1];
      const cpX = (prev.x + point.x) / 2;
      return `${path} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`;
    }, '');

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingY + graphHeight} L ${points[0].x} ${paddingY + graphHeight} Z`;

    const yLabels = Array.from({ length: 5 }, (_, i) => {
      // Calculate 5 evenly spaced labels from min to max
      const value = Math.round(minCalls + (range * (4 - i)) / 4);
      
      // Calculate Y position for the label
      const normalizedPos = (i / 4); // 0 (top) to 1 (bottom)
      const y = paddingY + normalizedPos * graphHeight;
      
      return { value, y };
    });

    return { points, linePath, areaPath, yLabels, maxCalls };
  }, [data, graphWidth, graphHeight]);

  const totalCalls = data.reduce((sum, d) => sum + d.calls, 0);
  const avgCalls = (data.length > 0 ? totalCalls / data.length : 0).toFixed(1);

  return (
    <div className="relative">
      <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-[320px]"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {chartData.yLabels.map((label, i) => (
            <g key={i}>
              <line
                x1={paddingX}
                y1={label.y}
                x2={chartWidth - paddingX}
                y2={label.y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={label.y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-medium"
              >
                {label.value}
              </text>
            </g>
          ))}

          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          <path d={chartData.areaPath} fill="url(#areaGradient)" className="transition-all duration-500" />

          <path
            d={chartData.linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500"
          />

          {chartData.points.map((point, index) => {
            // Show all labels for small datasets, every 5th for 30d
            const showLabel = data.length > 10 ? index % 5 === 0 || index === data.length - 1 : true;
            
            return (
              <g key={index} onMouseEnter={() => setHoveredIndex(index)} className="cursor-pointer">
                {/* Invisible touch target */}
                <circle cx={point.x} cy={point.y} r={data.length > 10 ? 15 : 25} fill="transparent" />
                
                {hoveredIndex === index && (
                  <circle cx={point.x} cy={point.y} r={data.length > 10 ? 8 : 12} fill="#e0e7ff" opacity="0.5" />
                )}
                
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={data.length > 10 ? (point.active ? 4 : 2.5) : (point.active ? 6 : 4)}
                  fill={point.active ? '#4f46e5' : hoveredIndex === index ? '#6366f1' : '#c7d2fe'}
                  stroke="white"
                  strokeWidth={data.length > 10 ? 1.5 : 2.5}
                  className="transition-all duration-200"
                />
                
                {showLabel && (
                  <text
                    x={point.x}
                    y={chartHeight - 15}
                    textAnchor="middle"
                    className={`text-[11px] transition-colors duration-200 ${
                      point.active || hoveredIndex === index ? 'fill-slate-900 font-bold' : 'fill-slate-400 font-medium'
                    }`}
                  >
                    {point.day}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hoveredIndex !== null && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-200"
            style={{
              left: chartData.points[hoveredIndex].x / chartWidth * 100 + '%',
              top: chartData.points[hoveredIndex].y / chartHeight * 100 - 8 + '%',
            }}
          >
            <div className="bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl ring-1 ring-white/10">
              <div className="font-black">{data[hoveredIndex].calls} calls</div>
              <div className="text-slate-400 font-bold uppercase tracking-tighter text-[9px] mt-0.5">{data[hoveredIndex].day}</div>
            </div>
          </div>
        )}
    </div>
  );
};
export default CallVolumeChart;
