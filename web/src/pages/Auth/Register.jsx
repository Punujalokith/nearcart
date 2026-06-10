import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Mail, Lock, Store, MapPin, ArrowRight, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

const schema = z.object({
  name:        z.string().min(2, 'Min 2 characters'),
  email:       z.string().email('Invalid email'),
  password:    z.string().min(8, 'Min 8 characters'),
  storeName:   z.string().min(2, 'Min 2 characters'),
  description: z.string().optional(),
  city:        z.string().optional(),
})

const steps = [
  { num: 1, label: 'Account' },
  { num: 2, label: 'Store Info' },
  { num: 3, label: 'Done' },
]

const fields = [
  { name: 'name',      label: 'Full Name',         icon: User,     placeholder: 'Your full name',          type: 'text' },
  { name: 'email',     label: 'Business Email',     icon: Mail,     placeholder: 'you@yourbusiness.com',   type: 'email' },
  { name: 'password',  label: 'Password',           icon: Lock,     placeholder: 'Min 8 characters',        type: 'password' },
  { name: 'storeName', label: 'Store Name',         icon: Store,    placeholder: 'My Awesome Store',        type: 'text' },
  { name: 'city',      label: 'City',               icon: MapPin,   placeholder: 'Kuala Lumpur',            type: 'text' },
  { name: 'description', label: 'Store Description (optional)', icon: FileText, placeholder: 'Tell buyers about your store...', type: 'textarea' },
]

export default function Register() {
  const navigate    = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ name, email, password, storeName, description, city }) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role: 'VENDOR' })
      const me  = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      })
      setAuth(me.data, res.data.accessToken, res.data.refreshToken)
      await api.post('/vendors', { storeName, description, city })
      toast.success('Vendor account created! Welcome to NearCart.')
      navigate('/dashboard')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-36 translate-x-36" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-40 -translate-x-40" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
            <ShoppingBag size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">NearCart</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Start selling<br />to your local<br />community.
          </h1>
          <p className="text-primary-200 text-base leading-relaxed mb-10 max-w-xs">
            Join thousands of vendors who are growing their business on Malaysia's hyperlocal marketplace.
          </p>

          {/* Progress steps */}
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                  {s.num}
                </div>
                <p className="text-white font-medium text-sm">{s.label}</p>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px bg-white/20 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-primary-200 text-sm relative z-10">
          Free to join — no monthly fees. 5% per sale only.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">NearCart</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Vendor Account</h2>
            <p className="text-gray-500 text-sm">Fill in the details below to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Account section */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Account Details</p>

            {['name', 'email', 'password'].map((fname) => {
              const f = fields.find((x) => x.name === fname)
              const Icon = f.icon
              return (
                <div key={fname}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register(f.name)}
                      type={f.type}
                      placeholder={f.placeholder}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    />
                  </div>
                  {errors[fname] && <p className="text-xs text-red-500 mt-1">{errors[fname].message}</p>}
                </div>
              )
            })}

            {/* Store section */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest pt-2">Store Details</p>

            {['storeName', 'city'].map((fname) => {
              const f = fields.find((x) => x.name === fname)
              const Icon = f.icon
              return (
                <div key={fname}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register(f.name)}
                      type={f.type}
                      placeholder={f.placeholder}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    />
                  </div>
                  {errors[fname] && <p className="text-xs text-red-500 mt-1">{errors[fname].message}</p>}
                </div>
              )
            })}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Description <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Tell buyers about your store..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create Vendor Account</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            By registering, you agree to our{' '}
            <span className="text-primary-600 cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-primary-600 cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
