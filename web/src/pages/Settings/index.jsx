import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/dashboard/settings',         label: 'Store Profile', end: true },
  { to: '/dashboard/settings/payouts', label: 'Payouts' },
]

export default function Settings() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your store and payout settings</p>
      </div>
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
