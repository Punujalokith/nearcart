import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle2, ExternalLink, AlertCircle, CreditCard, Zap, Shield, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

const HOW_IT_WORKS = [
  { icon: CreditCard, title: 'Buyer pays',          desc: 'Customers pay securely via Stripe Checkout' },
  { icon: Zap,        title: '95% to you',          desc: 'NearCart takes a 5% platform fee only' },
  { icon: Clock,      title: 'Fast payouts',         desc: 'Funds transferred every 2 business days' },
  { icon: Shield,     title: 'Secure & protected',   desc: 'Stripe handles all payment security' },
]

export default function PayoutSetup() {
  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['connect-status'],
    queryFn:  async () => { const res = await api.get('/payments/connect/status'); return res.data },
  })

  const onboard = useMutation({
    mutationFn: () => api.post('/payments/connect/onboard'),
    onSuccess:  (res) => { window.open(res.data.onboardingUrl, '_blank') },
    onError:    (e)   => toast.error(e.response?.data?.error || 'Failed to start onboarding'),
  })

  if (isLoading) return (
    <div className="max-w-2xl animate-pulse space-y-3">
      <div className="h-32 bg-gray-100 rounded-2xl" />
      <div className="h-48 bg-gray-100 rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-5">

      {/* Status card */}
      {status?.connected ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Stripe Connect Active</h3>
              <p className="text-sm text-gray-500 mt-0.5">Your store is ready to receive payments from buyers</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-xl border ${status.chargesEnabled ? 'bg-primary-50 border-primary-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm ${status.chargesEnabled ? 'text-primary-600' : 'text-red-500'}`}>
                  {status.chargesEnabled ? '✓' : '✗'} Charges
                </span>
              </div>
              <p className="text-xs text-gray-500">{status.chargesEnabled ? 'Enabled and ready' : 'Not yet enabled'}</p>
            </div>
            <div className={`p-4 rounded-xl border ${status.payoutsEnabled ? 'bg-primary-50 border-primary-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm ${status.payoutsEnabled ? 'text-primary-600' : 'text-red-500'}`}>
                  {status.payoutsEnabled ? '✓' : '✗'} Payouts
                </span>
              </div>
              <p className="text-xs text-gray-500">{status.payoutsEnabled ? 'Enabled and ready' : 'Not yet enabled'}</p>
            </div>
          </div>

          {!status.detailsSubmitted && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                Complete your Stripe onboarding to enable payouts. Click the button below to finish setup.
              </p>
            </div>
          )}

          <button
            onClick={() => onboard.mutate()}
            disabled={onboard.isPending}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-4 py-2.5 rounded-xl transition"
          >
            {onboard.isPending
              ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : <ExternalLink size={15} />
            }
            Update Stripe Account
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
              <AlertCircle size={22} className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Stripe Not Connected</h3>
              <p className="text-sm text-gray-500 mt-0.5">Connect your Stripe account to start receiving payments</p>
            </div>
          </div>

          <button
            onClick={() => onboard.mutate()}
            disabled={onboard.isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition"
          >
            {onboard.isPending
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <ExternalLink size={16} />
            }
            Connect with Stripe
          </button>

          <p className="text-center text-xs text-gray-400">
            Test mode only — use card <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">4242 4242 4242 4242</span>
          </p>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">How Payouts Work</h3>
        <div className="grid grid-cols-2 gap-3">
          {HOW_IT_WORKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={14} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
