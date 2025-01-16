import { TrendingUp, ShoppingBag, Clock, Package } from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics'
import { RevenueChart } from '../../components/charts/RevenueChart'
import { formatCurrency } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = useAnalytics()

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="h-72 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Revenue"    value={formatCurrency(data?.totalRevenue ?? 0)} color="bg-blue-500" />
        <StatCard icon={ShoppingBag} label="Today's Orders"  value={data?.todayOrders ?? 0}                  color="bg-green-500" />
        <StatCard icon={Clock}       label="Pending Orders"  value={data?.pendingOrders ?? 0}                 color="bg-orange-500" />
        <StatCard icon={Package}     label="Total Products"  value={data?.productCount ?? 0}                  color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6">Revenue — Last 7 Days</h2>
        <RevenueChart data={data?.revenueByDay ?? []} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">{data?.totalOrders ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Orders</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">{data?.productCount ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Active Products</p>
          </div>
        </div>
      </div>
    </div>
  )
}
