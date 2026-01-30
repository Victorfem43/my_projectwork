'use client';

export type OHLC = { time: number; open: number; high: number; low: number; close: number };

type Props = {
  data: OHLC[];
  height?: number;
  upColor?: string;
  downColor?: string;
};

export default function CandlestickChart({ data, height = 320, upColor = '#22c55e', downColor = '#ef4444' }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center bg-white/5 rounded-lg" style={{ height }}>
        <p className="text-gray-400">No candlestick data</p>
      </div>
    );
  }

  const prices = data.flatMap((d) => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;
  const padding = 20;
  const chartWidth = 100;
  const chartHeight = 100;
  const n = data.length || 1;
  const w = chartWidth / n;
  const barW = Math.max(1, Math.min(w * 0.8, w - 0.5));
  const gap = (w - barW) / 2;

  return (
    <div className="w-full rounded-lg overflow-hidden bg-white/5" style={{ height }}>
      <svg viewBox={`0 0 ${chartWidth + padding * 2} ${chartHeight + padding * 2}`} preserveAspectRatio="none" className="w-full h-full">
        {data.map((candle, i) => {
          const x = padding + i * w + gap / 2;
          const isUp = candle.close >= candle.open;
          const color = isUp ? upColor : downColor;
          const openY = 100 - ((candle.open - minPrice) / range) * chartHeight + padding;
          const closeY = 100 - ((candle.close - minPrice) / range) * chartHeight + padding;
          const highY = 100 - ((candle.high - minPrice) / range) * chartHeight + padding;
          const lowY = 100 - ((candle.low - minPrice) / range) * chartHeight + padding;
          const bodyTop = Math.min(openY, closeY);
          const bodyH = Math.max(2, Math.abs(closeY - openY));

          return (
            <g key={i}>
              {/* Wick: high to low */}
              <line
                x1={x + barW / 2}
                y1={highY}
                x2={x + barW / 2}
                y2={lowY}
                stroke={color}
                strokeWidth="0.5"
              />
              {/* Body: open to close */}
              <rect
                x={x}
                y={bodyTop}
                width={barW}
                height={bodyH}
                fill={color}
                stroke={color}
                strokeWidth="0.3"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
