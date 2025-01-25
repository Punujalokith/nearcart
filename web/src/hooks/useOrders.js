import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export function useVendorOrders() {
  return useQuery({
    queryKey: ['vendor-orders'],
    queryFn:  async () => { const res = await api.get('/orders/vendor/me'); return res.data },
    refetchInterval: 30000, // poll every 30s
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-orders'] }); toast.success('Order status updated!') },
    onError:   (e) => toast.error(e.response?.data?.error || 'Failed to update status'),
  })
}
