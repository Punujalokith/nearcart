import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2, Settings,
  CreditCard, Bell, LogOut, Store, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useVendorOrders } from '../../hooks/useOrders'

const mainMenu = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/products',  icon: Package,         label: 'Products' },
  { to: '/dashboard/orders',    icon: ShoppingCart,    label: 'Orders' },
  { to: '/dashboard/analytics', icon: BarChart2,       label: 'Analytics' },
  { to: '/dashboard/settings',  icon: Settings,        label: 'Settings' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { data: orders = [] } = useVendorOrders()
  const newOrders = Array.isArray(orders)
    ? orders.filter((o) => o.status === 'PENDING').length
    : 0

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
          <Store size={18} className="text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-base">NearCart</span>
          <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-md font-semibold">Vendor</span>
        </div>
      </div>

      {/* Store info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'V'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'My Store'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full inline-block" />
              <span className="text-xs text-gray-500">Active store</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">

        {/* Main Menu */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Main Menu</p>
          <div className="space-y-0.5">
            {mainMenu.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
                    <span className="flex-1">{label}</span>
                    {label === 'Orders' && newOrders > 0 && (
                      <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full font-semibold">
                        {newOrders} New
                      </span>
                    )}
                    {isActive && <ChevronRight size={13} className="text-primary-400" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Store */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Store</p>
          <div className="space-y-0.5">
            <NavLink
              to="/dashboard/settings/payouts"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <CreditCard size={17} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
                  <span className="flex-1">Stripe Connect</span>
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">Setup</span>
                </>
              )}
            </NavLink>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
              <Bell size={17} className="text-gray-400" />
              <span className="flex-1 text-left">Notifications</span>
            </button>
          </div>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); window.location.href = '/login' }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
