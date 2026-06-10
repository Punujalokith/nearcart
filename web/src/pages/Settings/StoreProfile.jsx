import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Store, MapPin, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

const schema = z.object({
  storeName:   z.string().min(2, 'Store name must be at least 2 characters'),
  description: z.string().optional(),
  city:        z.string().optional(),
})

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {hint && <span className="text-gray-400 font-normal ml-1 text-xs">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition'

export default function StoreProfile() {
  const qc = useQueryClient()

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor-me'],
    queryFn:  async () => { const res = await api.get('/vendors/me'); return res.data },
  })

  const updateVendor = useMutation({
    mutationFn: (data) => api.patch('/vendors/me', data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['vendor-me'] }); toast.success('Store profile updated!') },
    onError:    (e) => toast.error(e.response?.data?.error || 'Update failed'),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (vendor) reset({
      storeName:   vendor.storeName   || '',
      description: vendor.description || '',
      city:        vendor.city        || '',
    })
  }, [vendor, reset])

  if (isLoading) return (
    <div className="animate-pulse space-y-3 max-w-2xl">
      {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
    </div>
  )

  return (
    <div className="max-w-2xl space-y-5">

      {/* Approval notice */}
      {vendor && !vendor.isApproved ? (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Store Pending Approval</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your store is under review by the admin. Products won't be visible to buyers until approved.
            </p>
          </div>
        </div>
      ) : vendor?.isApproved ? (
        <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-100 rounded-2xl">
          <CheckCircle2 size={18} className="text-primary-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary-700">Store Approved</p>
            <p className="text-xs text-primary-600 mt-0.5">
              Your store is live! Customers can browse and order your products.
            </p>
          </div>
        </div>
      ) : null}

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
            <Store size={17} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Store Information</h2>
            <p className="text-xs text-gray-400">Update the details visible to buyers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit((d) => updateVendor.mutate(d))} className="space-y-4">
          <Field label="Store Name" error={errors.storeName?.message}>
            <div className="relative">
              <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input {...register('storeName')} placeholder="My Awesome Store" className={`${inputCls} pl-10`} />
            </div>
          </Field>

          <Field label="City" hint="(optional)" error={errors.city?.message}>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input {...register('city')} placeholder="Kuala Lumpur" className={`${inputCls} pl-10`} />
            </div>
          </Field>

          <Field label="Store Description" hint="(optional)" error={errors.description?.message}>
            <div className="relative">
              <FileText size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Tell buyers about your store, specialties, or operating hours..."
                className={`${inputCls} pl-10 resize-none`}
              />
            </div>
          </Field>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-2"
            >
              {isSubmitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                : 'Save Changes'
              }
            </button>
            {!isDirty && <p className="text-xs text-gray-400">No unsaved changes</p>}
          </div>
        </form>
      </div>
    </div>
  )
}
