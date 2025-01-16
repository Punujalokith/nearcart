import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function RevenueChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `RM${v}`} />
        <Tooltip
          formatter={(v) => [`RM ${Number(v).toFixed(2)}`, 'Revenue']}
          labelFormatter={(v) => new Date(v).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
        />
        <Line
          type="monotone" dataKey="revenue" stroke="#2563eb"
          strokeWidth={2} dot={{ fill: '#2563eb', r: 4 }} activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
