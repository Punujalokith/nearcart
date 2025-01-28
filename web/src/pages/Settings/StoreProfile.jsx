import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { Input, Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const schema = z.object({
  storeName:   z.string().min(2),
  description: z.string().optional(),
  city:        z.string().optional(),
})

export default function StoreProfile() {
  const qc = useQueryClient()
  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor-me'],
    queryFn:  async () => { const res = await api.get('/vendors/me'); return res.data },
  })

  const updateVendor = useMutation({
    mutationFn: (data) => api.patch('/vendors/me', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-me'] }); toast.success('Store profile updated!') },
    onError:   (e) => toast.error(e.response?.data?.error || 'Update failed'),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (vendor) reset({ storeName: vendor.storeName, description: vendor.description || '', city: vendor.city || '' })
  }, [vendor, reset])

  if (isLoading) return <div className="p-8 animate-pulse"><div className="h-64 bg-gray-200 rounded-xl" /></div>

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Profile</h1>
        <p className="text-gray-500 mt-1">Update your store information visible to buyers</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {!vendor?.isApproved && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">⏳ Your store is pending approval by an admin.</p>
            <p className="text-xs text-yellow-700 mt-1">Your products won't be visible to buyers until approved.</p>
          </div>
        )}

        <form onSubmit={handleSubmit((data) => updateVendor.mutate(data))} className="space-y-5">
          <Input label="Store Name" placeholder="My Awesome Store"
            error={errors.storeName?.message} {...register('storeName')} />
          <Textarea label="Description" placeholder="Tell buyers about your store..."
            error={errors.description?.message} {...register('description')} />
          <Input label="City" placeholder="Kuala Lumpur"
            error={errors.city?.message} {...register('city')} />
          <Button type="submit" loading={isSubmitting}>Save Changes</Button>
        </form>
      </div>
    </div>
  )
}
