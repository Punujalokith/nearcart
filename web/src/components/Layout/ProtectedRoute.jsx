import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Sidebar } from './Sidebar'

export function ProtectedRoute() {
  const { accessToken, user } = useAuthStore()

  if (!accessToken) return <Navigate to="/login" replace />
  if (user && user.role === 'BUYER') return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
