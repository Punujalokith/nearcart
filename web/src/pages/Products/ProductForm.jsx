import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef } from 'react'
import { Upload, X, Image } from 'lucide-react'
import { useCreateProduct, useUpdateProduct, useCategories, useUploadImages } from '../../hooks/useProducts'

const schema = z.object({
  name:        z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price:       z.coerce.number().positive('Must be a positive number'),
  stock:       z.coerce.number().int().min(0, 'Cannot be negative'),
  categoryId:  z.string().min(1, 'Select a category'),
})

function Field({ label, error, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function ProductForm({ product, onSuccess }) {
  const isEdit = !!product
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const uploadImages  = useUploadImages()
  const { data: categories = [] } = useCategories()
  const [images, setImages] = useState([])
  const fileRef = useRef()

  const allCategories = categories.flatMap((c) => [c, ...(c.children || [])])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: product
      ? { name: product.name, description: product.description, price: product.price, stock: product.stock, categoryId: product.categoryId }
      : {},
  })

  const onSubmit = async (data) => {
    try {
      let productId = product?.id
      if (isEdit) {
        await updateProduct.mutateAsync({ id: product.id, ...data })
      } else {
        const res = await createProduct.mutateAsync(data)
        productId = res.data.id
      }
      if (images.length > 0 && productId) {
        await uploadImages.mutateAsync({ productId, files: images })
      }
      onSuccess?.()
    } catch {}
  }

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      <Field label="Product Name" error={errors.name?.message} required>
        <input {...register('name')} placeholder="e.g. Fresh Apples 1kg" className={inputCls} />
      </Field>

      <Field label="Description" error={errors.description?.message} required>
        <textarea {...register('description')} rows={3} placeholder="Describe your product..." className={`${inputCls} resize-none`} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (LKR)" error={errors.price?.message} required>
          <input {...register('price')} type="number" step="0.01" placeholder="0.00" className={inputCls} />
        </Field>
        <Field label="Stock Quantity" error={errors.stock?.message} required>
          <input {...register('stock')} type="number" placeholder="0" className={inputCls} />
        </Field>
      </div>

      <Field label="Category" error={errors.categoryId?.message} required>
        <select {...register('categoryId')} className={`${inputCls} bg-white`}>
          <option value="">Select a category</option>
          {allCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parentId ? `   └ ${c.name}` : c.name}
            </option>
          ))}
        </select>
      </Field>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Product Images <span className="text-gray-400 font-normal">(optional, max 5)</span>
        </label>

        {/* Upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-xl p-6 text-center cursor-pointer transition-colors group"
        >
          <div className="w-10 h-10 bg-gray-100 group-hover:bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-2 transition">
            <Upload size={18} className="text-gray-400 group-hover:text-primary-500 transition" />
          </div>
          <p className="text-sm text-gray-500 group-hover:text-gray-700 transition">
            Click to upload images
          </p>
          <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP up to 10MB each</p>
          <input
            ref={fileRef} type="file" multiple accept="image/*" className="hidden"
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
          />
        </div>

        {/* New images preview */}
        {images.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {images.map((f, i) => (
              <div key={i} className="relative group">
                <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Existing images */}
        {product?.imageUrls?.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Current images</p>
            <div className="flex gap-2 flex-wrap">
              {product.imageUrls.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                  <div className="absolute inset-0 rounded-xl bg-black/5 flex items-center justify-center">
                    <Image size={12} className="text-white/70" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
        >
          {isSubmitting
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            : isEdit ? 'Save Changes' : 'Create Product'
          }
        </button>
      </div>
    </form>
  )
}
