import { NavLink, Outlet } from 'react-router-dom'
import { Store, CreditCard } from 'lucide-react'

const tabs = [
  { to: '/dashboard/settings',         label: 'Store Profile', icon: Store,      end: true },
  { to: '/dashboard/settings/payouts', label: 'Payouts',       icon: CreditCard, end: false },
]

export default function Settings() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your store profile and payout configuration</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
