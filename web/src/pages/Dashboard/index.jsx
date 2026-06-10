import { TrendingUp, ShoppingBag, Clock, Package, ArrowUpRight, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useVendorOrders } from '../../hooks/useOrders'
import { RevenueChart } from '../../components/charts/RevenueChart'
import { formatCurrency, formatDateTime, ORDER_STATUS_COLORS } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start justify-between group hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={19} className="text-white" />
        </div>
        {trend != null && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? 'text-primary-600' : 'text-red-500'}`}>
            <ArrowUpRight size={12} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )
}

const STATUS_LABEL = {
  PENDING:          'Pending',
  CONFIRMED:        'Confirmed',
  PREPARING:        'Preparing',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED:        'Delivered',
  CANCELLED:        'Cancelled',
  REFUNDED:         'Refunded',
}

function Skeleton({ h = 'h-24', className = '' }) {
  return <div className={`bg-gray-100 animate-pulse rounded-2xl ${h} ${className}`} />
}

export default function Dashboard() {
  const user               = useAuthStore((s) => s.user)
  const { data, isLoading } = useAnalytics()
  const { data: orders = [] } = useVendorOrders()

  const hour       = new Date().getHours()
  const greeting   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : []

  if (isLoading) return (
    <div className="p-6 space-y-5">
      <Skeleton h="h-10" className="w-56" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} h="h-28" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Skeleton h="h-72 xl:col-span-2" />
        <Skeleton h="h-72" />
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <Link
          to="/dashboard/analytics"
          className="hidden sm:flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium bg-primary-50 px-3 py-2 rounded-xl"
        >
          View Analytics <ArrowRight size={14} />
        </Link>
      </div>

      {/* Greeting banner */}
      {!data?.totalOrders && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">Welcome to your store dashboard!</p>
            <p className="text-primary-100 text-sm mt-1">Start by adding your first product and sharing your store link.</p>
          </div>
          <Link
            to="/dashboard/products"
            className="bg-white text-primary-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-primary-50 transition shrink-0"
          >
            Add Product
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}  label="Total Revenue"
          value={formatCurrency(data?.totalRevenue ?? 0)}
          sub="All time" color="bg-primary-500" trend={12}
        />
        <StatCard
          icon={ShoppingBag} label="Today's Orders"
          value={data?.todayOrders ?? 0}
          sub="Since midnight" color="bg-blue-500"
        />
        <StatCard
          icon={Clock}       label="Pending"
          value={data?.pendingOrders ?? 0}
          sub="Awaiting action" color="bg-amber-500"
        />
        <StatCard
          icon={Package}     label="Products"
          value={data?.productCount ?? 0}
          sub="Active listings" color="bg-purple-500"
        />
      </div>

      {/* Chart + top orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
            </div>
            <span className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">
              {formatCurrency(data?.totalRevenue ?? 0)} total
            </span>
          </div>
          <RevenueChart data={data?.revenueByDay ?? []} />
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-3 flex-1">
            {[
              { label: 'Total Orders',    value: data?.totalOrders ?? 0,    color: 'bg-blue-50 text-blue-700' },
              { label: 'Pending Orders',  value: data?.pendingOrders ?? 0,  color: 'bg-amber-50 text-amber-700' },
              { label: 'Active Products', value: data?.productCount ?? 0,   color: 'bg-primary-50 text-primary-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">{label}</span>
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-lg ${color}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <Link to="/dashboard/products" className="flex items-center justify-center gap-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 py-2.5 rounded-xl transition">
              Manage Products <ArrowRight size={14} />
            </Link>
            <Link to="/dashboard/orders" className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 py-2.5 rounded-xl transition">
              View Orders <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                    #{o.id.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{o.buyer?.name}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(o.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(o.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
