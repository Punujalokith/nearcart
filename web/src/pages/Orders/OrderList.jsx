import { useState } from 'react'
import { Eye } from 'lucide-react'
import { useVendorOrders, useUpdateOrderStatus } from '../../hooks/useOrders'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatCurrency, formatDateTime, ORDER_NEXT_STATUS } from '../../lib/utils'
import { Modal } from '../../components/ui/Modal'
import { OrderDetail } from './OrderDetail'

export default function OrderList() {
  const { data: orders = [], isLoading } = useVendorOrders()
  const updateStatus = useUpdateOrderStatus()
  const [selected, setSelected] = useState(null)

  if (isLoading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-gray-500">No orders yet. Share your store to get your first order!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => {
                const nextStatus = ORDER_NEXT_STATUS[o.status]
                return (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      #{o.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{o.buyer?.name}</p>
                      <p className="text-xs text-gray-500">{o.buyer?.phone || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {o.items?.length} item{o.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {nextStatus && (
                          <Button
                            size="sm"
                            loading={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ id: o.id, status: nextStatus })}
                          >
                            → {nextStatus.replace(/_/g, ' ')}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setSelected(o)}>
                          <Eye size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Order Details" size="lg">
        {selected && <OrderDetail order={selected} onStatusUpdate={(id, status) => {
          updateStatus.mutate({ id, status })
          setSelected(null)
        }} />}
      </Modal>
    </div>
  )
}
