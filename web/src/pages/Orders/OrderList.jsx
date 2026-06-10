import { useState } from 'react'
import { Eye, ShoppingBag } from 'lucide-react'
import { useVendorOrders, useUpdateOrderStatus } from '../../hooks/useOrders'
import { formatCurrency, formatDateTime, ORDER_STATUS_COLORS, ORDER_NEXT_STATUS } from '../../lib/utils'
import { Modal } from '../../components/ui/Modal'
import { OrderDetail } from './OrderDetail'

const ALL_STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

const TAB_LABEL = {
  ALL:              'All',
  PENDING:          'Pending',
  CONFIRMED:        'Confirmed',
  PREPARING:        'Preparing',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED:        'Delivered',
  CANCELLED:        'Cancelled',
}

const STATUS_DOT = {
  PENDING:          'bg-amber-400',
  CONFIRMED:        'bg-blue-400',
  PREPARING:        'bg-purple-400',
  OUT_FOR_DELIVERY: 'bg-orange-400',
  DELIVERED:        'bg-primary-500',
  CANCELLED:        'bg-red-400',
  REFUNDED:         'bg-gray-400',
}

export default function OrderList() {
  const { data: orders = [], isLoading } = useVendorOrders()
  const updateStatus = useUpdateOrderStatus()
  const [selected, setSelected]       = useState(null)
  const [activeTab, setActiveTab]     = useState('ALL')

  const filtered = activeTab === 'ALL'
    ? orders
    : orders.filter((o) => o.status === activeTab)

  const countFor = (s) => s === 'ALL' ? orders.length : orders.filter((o) => o.status === s).length

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-gray-100 rounded-xl w-40" />
        <div className="h-10 bg-gray-100 rounded-xl" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {ALL_STATUSES.map((s) => {
          const count = countFor(s)
          const active = activeTab === s
          return (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                active
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {s !== 'ALL' && <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : STATUS_DOT[s]}`} />}
              {TAB_LABEL[s]}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={24} className="text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No {activeTab !== 'ALL' ? TAB_LABEL[activeTab].toLowerCase() : ''} orders</h3>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === 'ALL' ? 'Share your store to start receiving orders!' : `No orders with "${TAB_LABEL[activeTab]}" status.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((o) => {
                const nextStatus = ORDER_NEXT_STATUS[o.status]
                return (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        #{o.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">{o.buyer?.name}</p>
                      <p className="text-xs text-gray-400">{o.buyer?.phone || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {o.items?.length ?? 0} item{(o.items?.length ?? 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[o.status] || 'bg-gray-400'}`} />
                        {TAB_LABEL[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {nextStatus && (
                          <button
                            disabled={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ id: o.id, status: nextStatus })}
                            className="text-xs font-semibold text-primary-600 hover:bg-primary-50 border border-primary-200 px-2.5 py-1.5 rounded-lg transition"
                          >
                            {nextStatus.replace(/_/g, ' ')}
                          </button>
                        )}
                        <button
                          onClick={() => setSelected(o)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Eye size={15} />
                        </button>
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
        {selected && (
          <OrderDetail
            order={selected}
            onStatusUpdate={(id, status) => { updateStatus.mutate({ id, status }); setSelected(null) }}
          />
        )}
      </Modal>
    </div>
  )
}
