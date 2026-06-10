import { CheckCircle, Circle, Clock, Truck, Package, XCircle, MapPin, User, Phone } from 'lucide-react'
import { formatCurrency, formatDateTime, ORDER_STATUS_COLORS, ORDER_NEXT_STATUS } from '../../lib/utils'

const TIMELINE = [
  { status: 'PENDING',          icon: Clock,        label: 'Order Placed',        color: 'text-amber-500'  },
  { status: 'CONFIRMED',        icon: CheckCircle,  label: 'Order Confirmed',     color: 'text-blue-500'   },
  { status: 'PREPARING',        icon: Package,      label: 'Preparing',           color: 'text-purple-500' },
  { status: 'OUT_FOR_DELIVERY', icon: Truck,        label: 'Out for Delivery',    color: 'text-orange-500' },
  { status: 'DELIVERED',        icon: CheckCircle,  label: 'Delivered',           color: 'text-primary-500'},
]

const STATUS_ORDER = TIMELINE.map((t) => t.status)

const TAB_LABEL = {
  PENDING:          'Pending',
  CONFIRMED:        'Confirmed',
  PREPARING:        'Preparing',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED:        'Delivered',
  CANCELLED:        'Cancelled',
  REFUNDED:         'Refunded',
}

export function OrderDetail({ order, onStatusUpdate }) {
  const nextStatus    = ORDER_NEXT_STATUS[order.status]
  const currentIndex  = STATUS_ORDER.indexOf(order.status)
  const isCancelled   = order.status === 'CANCELLED' || order.status === 'REFUNDED'

  return (
    <div className="space-y-5">

      {/* Top info bar */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">Order ID</p>
          <p className="font-mono font-bold text-gray-900 text-lg">
            #{order.id.substring(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-gray-400 mt-1">{formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
          {TAB_LABEL[order.status] || order.status}
        </span>
      </div>

      {/* Delivery timeline */}
      {!isCancelled && (
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Delivery Progress</p>
          <div className="flex items-center">
            {TIMELINE.map((step, idx) => {
              const done    = idx <= currentIndex
              const current = idx === currentIndex
              const Icon    = step.icon
              return (
                <div key={step.status} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                      done
                        ? `${step.color.replace('text-', 'border-')} bg-white`
                        : 'border-gray-200 bg-white'
                    } ${current ? 'ring-4 ring-offset-1 ring-primary-100' : ''}`}>
                      <Icon size={14} className={done ? step.color : 'text-gray-300'} />
                    </div>
                    <span className={`text-xs text-center leading-tight hidden sm:block ${done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < TIMELINE.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-4 ${idx < currentIndex ? 'bg-primary-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
          <XCircle size={20} className="text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-700 text-sm">Order {TAB_LABEL[order.status]}</p>
            <p className="text-xs text-red-500 mt-0.5">This order is no longer active</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Customer */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Customer</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User size={13} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">{order.buyer?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-gray-400" />
              <p className="text-sm text-gray-600">{order.buyer?.phone || 'No phone'}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        {order.address && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Delivery Address</p>
            <div className="flex items-start gap-2">
              <MapPin size={13} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{order.address.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{order.address.line1}</p>
                <p className="text-xs text-gray-500">{order.address.city}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Order Items ({order.items?.length ?? 0})
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {item.product?.imageUrls?.[0] ? (
                  <img src={item.product.imageUrls[0]} alt="" className="w-11 h-11 rounded-xl object-cover border border-gray-100" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Package size={14} className="text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.product?.name}</p>
                  <p className="text-xs text-gray-400">x{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {formatCurrency(Number(item.unitPrice) * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Order Total</p>
          <p className="text-lg font-bold text-primary-600">{formatCurrency(order.totalAmount)}</p>
        </div>
      </div>

      {nextStatus && (
        <button
          onClick={() => onStatusUpdate(order.id, nextStatus)}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition text-sm"
        >
          Mark as {nextStatus.replace(/_/g, ' ')}
        </button>
      )}
    </div>
  )
}
