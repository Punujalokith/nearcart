import { TrendingUp, ShoppingBag, Clock, Package, Calendar, BarChart2 } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip,
} from 'recharts'
import { useAnalytics } from '../../hooks/useAnalytics'
import { RevenueChart } from '../../components/charts/RevenueChart'
import { formatCurrency, ORDER_STATUS_COLORS } from '../../lib/utils'

const STATUS_COLORS = ['#16a34a', '#3b82f6', '#a855f7', '#f97316', '#64748b', '#ef4444']

const STATUS_LABEL = {
  PENDING:          'Pending',
  CONFIRMED:        'Confirmed',
  PREPARING:        'Preparing',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED:        'Delivered',
  CANCELLED:        'Cancelled',
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
  )
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2.5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-primary-600">{formatCurrency(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="p-6 space-y-5 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-xl w-40" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="h-72 bg-gray-100 rounded-2xl" />
    </div>
  )
}

export default function Analytics() {
  const { data, isLoading } = useAnalytics()

  if (isLoading) return <Skeleton />

  // Compute order status breakdown from orders
  const statusCounts = {}
  if (data?.orders) {
    data.orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
    })
  }
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABEL[status] || status,
    value: count,
    status,
  }))

  // Revenue by day for bar chart comparison
  const revenueByDay = data?.revenueByDay ?? []

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Track your store performance and revenue insights</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-xl">
          <Calendar size={13} />
          <span>Last 7 days</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp} label="Total Revenue"
          value={formatCurrency(data?.totalRevenue ?? 0)}
          sub="All time" color="bg-primary-500"
        />
        <StatCard
          icon={ShoppingBag} label="Total Orders"
          value={data?.totalOrders ?? 0}
          sub="All time" color="bg-blue-500"
        />
        <StatCard
          icon={Clock} label="Pending Orders"
          value={data?.pendingOrders ?? 0}
          sub="Need action" color="bg-amber-500"
        />
        <StatCard
          icon={Package} label="Products"
          value={data?.productCount ?? 0}
          sub="Active listings" color="bg-purple-500"
        />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Revenue Trend</h2>
            <p className="text-xs text-gray-400 mt-0.5">Daily revenue for the last 7 days</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary-500 inline-block" />
            <span className="text-xs text-gray-500">Revenue</span>
          </div>
        </div>
        <RevenueChart data={revenueByDay} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Daily Revenue Breakdown</h2>
            <p className="text-xs text-gray-400 mt-0.5">Revenue per day (bar view)</p>
          </div>
          {revenueByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `LKR${v}`}
                />
                <BarTooltip content={<CustomBarTooltip />} />
                <Bar dataKey="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <div className="text-center">
                <BarChart2 size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No revenue data yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Order status donut */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Order Status Breakdown</h2>
            <p className="text-xs text-gray-400 mt-0.5">Distribution of order statuses</p>
          </div>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <PieTooltip
                    formatter={(v, name) => [v, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((entry, index) => (
                  <div key={entry.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[index % STATUS_COLORS.length] }} />
                      <span className="text-xs text-gray-600">{entry.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center">
              <div className="text-center">
                <Package size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No orders yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Performance Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue',       value: formatCurrency(data?.totalRevenue ?? 0),    badge: 'bg-primary-50 text-primary-700' },
            { label: "Today's Orders",      value: data?.todayOrders ?? 0,                      badge: 'bg-blue-50 text-blue-700' },
            { label: 'Pending Orders',      value: data?.pendingOrders ?? 0,                    badge: 'bg-amber-50 text-amber-700' },
            { label: 'Total Orders',        value: data?.totalOrders ?? 0,                      badge: 'bg-gray-50 text-gray-700' },
            { label: 'Active Products',     value: data?.productCount ?? 0,                     badge: 'bg-purple-50 text-purple-700' },
            { label: 'Avg. Order Value',    value: data?.totalOrders ? formatCurrency((data?.totalRevenue ?? 0) / data.totalOrders) : 'LKR 0.00', badge: 'bg-primary-50 text-primary-700' },
          ].map(({ label, value, badge }) => (
            <div key={label} className={`rounded-xl p-4 ${badge}`}>
              <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
