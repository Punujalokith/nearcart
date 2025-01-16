import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders/vendor/me'),
        api.get('/vendors/me'),
      ])
      const orders   = ordersRes.data
      const vendorMe = productsRes.data

      // Revenue by day (last 7 days)
      const now   = new Date()
      const days  = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
      })

      const revenueByDay = days.map((day) => ({
        date: day,
        revenue: orders
          .filter((o) => o.status === 'DELIVERED' && o.createdAt.startsWith(day))
          .reduce((s, o) => s + Number(o.totalAmount), 0),
      }))

      const totalRevenue = orders
        .filter((o) => o.status === 'DELIVERED')
        .reduce((s, o) => s + Number(o.totalAmount), 0)

      const todayOrders = orders.filter(
        (o) => o.createdAt.startsWith(new Date().toISOString().split('T')[0])
      ).length

      const pendingOrders = orders.filter((o) =>
        ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status)
      ).length

      return {
        revenueByDay,
        totalRevenue,
        todayOrders,
        pendingOrders,
        totalOrders: orders.length,
        productCount: vendorMe._count?.products ?? 0,
      }
    },
  })
}
