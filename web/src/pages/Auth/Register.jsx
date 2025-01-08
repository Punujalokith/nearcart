import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Store } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const schema = z.object({
  name:        z.string().min(2, 'Min 2 characters'),
  email:       z.string().email('Invalid email'),
  password:    z.string().min(8, 'Min 8 characters'),
  storeName:   z.string().min(2, 'Min 2 characters'),
  description: z.string().optional(),
  city:        z.string().optional(),
})

export default function Register() {
  const navigate    = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ name, email, password, storeName, description, city }) => {
    try {
      // 1. Register user as VENDOR
      const res = await api.post('/auth/register', { name, email, password, role: 'VENDOR' })
      const me  = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      })
      setAuth(me.data, res.data.accessToken, res.data.refreshToken)

      // 2. Create vendor profile
      await api.post('/vendors', { storeName, description, city })

      toast.success('Vendor account created! Welcome to NearCart.')
      navigate('/dashboard')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <Store size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Vendor Account</h1>
          <p className="text-gray-500 mt-1">Start selling on NearCart</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Details</p>
            <Input label="Full Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="Min 8 characters" error={errors.password?.message} {...register('password')} />

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Store Details</p>
            <Input label="Store Name" placeholder="My Awesome Store" error={errors.storeName?.message} {...register('storeName')} />
            <Input label="City" placeholder="Kuala Lumpur" error={errors.city?.message} {...register('city')} />

            <Button type="submit" loading={isSubmitting} className="w-full mt-2">
              Create Account
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
