import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import { ProtectedRoute } from './components/Layout/ProtectedRoute'
import Login        from './pages/Auth/Login'
import Register     from './pages/Auth/Register'
import Dashboard    from './pages/Dashboard/index'
import ProductList  from './pages/Products/ProductList'
import OrderList    from './pages/Orders/OrderList'
import Analytics    from './pages/Analytics/index'
import Settings     from './pages/Settings/index'
import StoreProfile from './pages/Settings/StoreProfile'
import PayoutSetup  from './pages/Settings/PayoutSetup'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"           element={<Dashboard />} />
            <Route path="/dashboard/products"  element={<ProductList />} />
            <Route path="/dashboard/orders"    element={<OrderList />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route path="/dashboard/settings"  element={<Settings />}>
              <Route index          element={<StoreProfile />} />
              <Route path="payouts" element={<PayoutSetup />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontSize: '14px' },
        }}
      />
    </QueryClientProvider>
  )
}
