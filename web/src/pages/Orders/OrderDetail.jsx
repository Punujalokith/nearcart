import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatCurrency, formatDateTime, ORDER_NEXT_STATUS } from '../../lib/utils'

export function OrderDetail({ order, onStatusUpdate }) {
  const nextStatus = ORDER_NEXT_STATUS[order.status]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="font-mono font-semibold">#{order.id.substring(0, 8).toUpperCase()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Customer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Customer</p>
        <p className="font-medium text-gray-900">{order.buyer?.name}</p>
        <p className="text-sm text-gray-500">{order.buyer?.phone || 'No phone'}</p>
      </div>

      {/* Address */}
      {order.address && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Delivery Address</p>
          <p className="font-medium text-gray-900">{order.address.label}</p>
          <p className="text-sm text-gray-500">{order.address.line1}, {order.address.city}</p>
        </div>
      )}

      {/* Items */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Items</p>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                {item.product?.imageUrls?.[0] ? (
                  <img src={item.product.imageUrls[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-200" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.product?.name}</p>
                  <p className="text-xs text-gray-500">x{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                </div>
              </div>
              <p className="text-sm font-semibold">{formatCurrency(Number(item.unitPrice) * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200">
          <p className="font-semibold text-gray-900">Total</p>
          <p className="font-bold text-blue-600 text-lg">{formatCurrency(order.totalAmount)}</p>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        Placed on {formatDateTime(order.createdAt)}
      </div>

      {nextStatus && (
        <Button className="w-full" onClick={() => onStatusUpdate(order.id, nextStatus)}>
          Mark as {nextStatus.replace(/_/g, ' ')}
        </Button>
      )}
    </div>
  )
}
