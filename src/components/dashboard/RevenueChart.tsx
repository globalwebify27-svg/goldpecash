"use client";

import { useState } from "react";
import { TrendingUp, ArrowUpRight } from "lucide-react";

const fallbacks: any = {
  daily: [
    { label: "Mon", amount: 0 }, { label: "Tue", amount: 0 }, { label: "Wed", amount: 0 },
    { label: "Thu", amount: 0 }, { label: "Fri", amount: 0 }, { label: "Sat", amount: 0 }, { label: "Sun", amount: 0 }
  ],
  weekly: [
    { label: "W1", amount: 0 }, { label: "W2", amount: 0 }, { label: "W3", amount: 0 }, { label: "W4", amount: 0 }
  ],
  monthly: [
    { label: "Jan", amount: 0 }, { label: "Feb", amount: 0 }, { label: "Mar", amount: 0 },
    { label: "Apr", amount: 0 }, { label: "May", amount: 0 }, { label: "Jun", amount: 0 }
  ]
};

export default function RevenueChart({ data: allData }: { data?: any }) {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  
  const chartData = allData?.[timeframe]?.length > 0 ? allData[timeframe] : fallbacks[timeframe];
  const max = Math.max(...chartData.map((d: any) => parseFloat(d.amount) || 0), 10000);
  const total = chartData.reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);
  const avg = total / chartData.length;
  const highest = [...chartData].sort((a: any, b: any) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0))[0];

  const height = 200;
  const width = 500;
  
  // Create SVG path points
  const points = chartData.map((d: any, i: number) => {
    const x = chartData.length > 1 ? (i / (chartData.length - 1)) * width : width / 2;
    const y = height - ((parseFloat(d.amount) || 0) / (max || 1)) * height * 0.8;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = chartData.length > 1 
    ? `0,${height} ${points} ${width},${height}`
    : `${width / 2},${height} ${points} ${width / 2},${height}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Growth</h2>
          <p className="text-sm text-slate-500">Real-time purchase volume</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          {(['daily', 'weekly', 'monthly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                timeframe === t 
                  ? "bg-white dark:bg-slate-800 text-primary shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative pt-4">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-[200px] overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              y1={(i / 4) * height}
              x2={width}
              y2={(i / 4) * height}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="1"
            />
          ))}

          {/* Area */}
          <polyline
            points={areaPoints}
            fill="url(#gradient)"
            className="animate-in fade-in slide-in-from-bottom-4 duration-1000"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-in fade-in slide-in-from-bottom-2 duration-700"
          />

          {/* Points */}
          {chartData.map((d: any, i: number) => {
            const x = chartData.length > 1 ? (i / (chartData.length - 1)) * width : width / 2;
            const y = height - ((parseFloat(d.amount) || 0) / (max || 1)) * height * 0.8;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="var(--background)"
                stroke="var(--color-primary)"
                strokeWidth="2"
                className="animate-in zoom-in duration-500 delay-300"
              />
            );
          })}
        </svg>

        {/* Labels */}
        <div className="flex justify-between mt-4">
          {chartData.map((d: any) => (
            <span key={d.label} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {d.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Highest {timeframe.slice(0, -2)}</p>
          <p className="font-bold text-slate-900 dark:text-white">
            {highest.label} (₹{(parseFloat(highest.amount) / 1000).toFixed(1)}k)
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase text-slate-400">Avg. Payout</p>
          <p className="font-bold text-slate-900 dark:text-white">
            ₹{(avg / 1000).toFixed(1)}k
          </p>
        </div>
      </div>
    </div>
  );
}
