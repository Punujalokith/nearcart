export function formatCurrency(amount) {
  return `RM ${Number(amount || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export const ORDER_STATUS_COLORS = {
  PENDING:          'bg-amber-100 text-amber-700',
  CONFIRMED:        'bg-blue-100 text-blue-700',
  PREPARING:        'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED:        'bg-primary-100 text-primary-700',
  CANCELLED:        'bg-red-100 text-red-700',
  REFUNDED:         'bg-gray-100 text-gray-600',
}

export const ORDER_STATUS_DOT = {
  PENDING:          'bg-amber-400',
  CONFIRMED:        'bg-blue-400',
  PREPARING:        'bg-purple-400',
  OUT_FOR_DELIVERY: 'bg-orange-400',
  DELIVERED:        'bg-primary-500',
  CANCELLED:        'bg-red-400',
  REFUNDED:         'bg-gray-400',
}

export const ORDER_NEXT_STATUS = {
  PENDING:          'CONFIRMED',
  CONFIRMED:        'PREPARING',
  PREPARING:        'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
}
