export function formatCurrency(amount) {
  return `RM ${Number(amount).toFixed(2)}`
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
  PENDING:          'bg-yellow-100 text-yellow-800',
  CONFIRMED:        'bg-blue-100 text-blue-800',
  PREPARING:        'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED:        'bg-green-100 text-green-800',
  CANCELLED:        'bg-red-100 text-red-800',
  REFUNDED:         'bg-gray-100 text-gray-800',
}

export const ORDER_NEXT_STATUS = {
  PENDING:          'CONFIRMED',
  CONFIRMED:        'PREPARING',
  PREPARING:        'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
}
