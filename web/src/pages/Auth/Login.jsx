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
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
})

export default function Login() {
  const navigate  = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const res  = await api.post('/auth/login', data)
      const me   = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      })
      if (me.data.role === 'BUYER') {
        toast.error('This dashboard is for vendors only. Register as a vendor first.')
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <Store size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Sign In</h1>
          <p className="text-gray-500 mt-1">Access your NearCart dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Email" type="email" placeholder="you@example.com"
              error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="••••••••"
              error={errors.password?.message} {...register('password')} />
            <Button type="submit" loading={isSubmitting} className="w-full">
              Sign In
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            New vendor?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
