import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle, ExternalLink, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { Button } from '../../components/ui/Button'

export default function PayoutSetup() {
  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['connect-status'],
    queryFn:  async () => { const res = await api.get('/payments/connect/status'); return res.data },
  })

  const onboard = useMutation({
    mutationFn: () => api.post('/payments/connect/onboard'),
    onSuccess: (res) => { window.open(res.data.onboardingUrl, '_blank') },
    onError:   (e)   => toast.error(e.response?.data?.error || 'Failed to start onboarding'),
  })

  if (isLoading) return (
    <div className="p-8 animate-pulse"><div className="h-64 bg-gray-200 rounded-xl" /></div>
  )

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payout Setup</h1>
        <p className="text-gray-500 mt-1">Connect your bank account to receive payments</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {status?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-500" />
              <div>
                <p className="font-semibold text-gray-900">Stripe Connect Active</p>
                <p className="text-sm text-gray-500">Your store is ready to receive payments</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${status.chargesEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-sm font-medium">{status.chargesEnabled ? '✅' : '❌'} Charges</p>
                <p className="text-xs text-gray-500 mt-1">{status.chargesEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div className={`p-4 rounded-lg border ${status.payoutsEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-sm font-medium">{status.payoutsEnabled ? '✅' : '❌'} Payouts</p>
                <p className="text-xs text-gray-500 mt-1">{status.payoutsEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            {!status.detailsSubmitted && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle size={18} className="text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-sm text-yellow-800">Complete your Stripe onboarding to enable payouts</p>
              </div>
            )}
            <Button variant="secondary" onClick={() => onboard.mutate()} loading={onboard.isPending} className="gap-2">
              <ExternalLink size={16} /> Update Stripe Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-orange-500" />
              <div>
                <p className="font-semibold text-gray-900">Stripe Not Connected</p>
                <p className="text-sm text-gray-500">Connect Stripe to receive payments from orders</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <p className="text-sm font-medium text-blue-900">How it works:</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Buyers pay via Stripe Checkout</li>
                <li>NearCart takes a 5% platform fee</li>
                <li>Remaining 95% goes directly to your bank</li>
                <li>Payouts every 2 business days</li>
              </ul>
            </div>
            <Button onClick={() => onboard.mutate()} loading={onboard.isPending} className="gap-2">
              <ExternalLink size={16} /> Connect with Stripe
            </Button>
            <p className="text-xs text-gray-400">
              Using Stripe test mode — no real money involved. Use test card 4242 4242 4242 4242.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
