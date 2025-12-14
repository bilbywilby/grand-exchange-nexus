import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import type { GraphData } from '@/types/osrs';
const formatNumber = (num: number) => {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}b`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}m`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
};
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 p-4 border border-slate-700 rounded-lg shadow-lg">
        <p className="label text-slate-300">{`${format(new Date(label as number), 'MMM d, yyyy')}`}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {`${p.name}: ${formatNumber(p.value)} gp`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
export function PriceChart({ data }: { data: GraphData }) {
  const chartData = Object.keys(data.daily).map(timestamp => ({
    date: parseInt(timestamp, 10),
    daily: data.daily[timestamp],
    average: data.average[timestamp],
  })).sort((a, b) => a.date - b.date);
  if (!chartData || chartData.length === 0) {
    return <div className="text-center text-slate-400 p-8">No price data available for this item.</div>;
  }
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="date"
            tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM d')}
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatNumber}
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line type="monotone" dataKey="daily" name="Daily Price" stroke="#eab308" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="average" name="30d Average" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}