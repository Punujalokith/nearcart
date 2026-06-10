import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, BarChart2, Package, ArrowRight, Mail, Lock, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const features = [
  { icon: Package,     title: 'Product Management',  desc: 'Add, edit, and manage your entire catalog' },
  { icon: BarChart2,   title: 'Real-time Analytics', desc: 'Track revenue, orders, and customer insights' },
  { icon: ShoppingBag, title: 'Order Fulfillment',   desc: 'Process and track deliveries in real-time' },
]

export default function Login() {
  const navigate    = useNavigate()
  const { setAuth } = useAuthStore()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data)
      const me  = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      })
      if (me.data.role === 'BUYER') {
        toast.error('This dashboard is for vendors only.')
        return
      }
      setAuth(me.data, res.data.accessToken, res.data.refreshToken)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left green panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-40 translate-x-40" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
            <ShoppingBag size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">NearCart</span>
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">Vendor</span>
        </div>

        {/* Copy */}
        <div className="relative z-10">
          <p className="text-primary-200 text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-px bg-primary-300 inline-block" />
            Hyperlocal Marketplace
          </p>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Grow your local<br />business smarter.
          </h1>
          <p className="text-primary-200 text-base leading-relaxed mb-10 max-w-sm">
            Manage products, track orders, and analyze your store performance — all from one powerful vendor dashboard.
          </p>
          <div className="space-y-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white/10 rounded-2xl p-4">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-primary-200 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 relative z-10">
          {[
            { value: '12K+', label: 'Active Vendors' },
            { value: '98%',  label: 'Satisfaction Rate' },
            { value: 'RM 4.2M', label: 'Monthly Sales' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-white font-extrabold text-2xl">{value}</p>
              <p className="text-primary-200 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right white panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">NearCart</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500">Sign in to your vendor portal to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@yourbusiness.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <span className="text-sm text-primary-600 font-medium cursor-pointer">Forgot password?</span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {isSubmitting
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign in to Vendor Portal</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            New vendor?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Apply for a vendor account
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
            {['Secure Login', '256-bit SSL', 'Privacy Protected'].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <Shield size={11} className="text-primary-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
