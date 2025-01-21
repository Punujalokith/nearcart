import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { useCreateProduct, useUpdateProduct, useCategories, useUploadImages } from '../../hooks/useProducts'
import { Input, Textarea, Select } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const schema = z.object({
  name:        z.string().min(2),
  description: z.string().min(5),
  price:       z.coerce.number().positive(),
  stock:       z.coerce.number().int().min(0),
  categoryId:  z.string().min(1, 'Select a category'),
})

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
    defaultValues: product ? {
      name: product.name, description: product.description,
      price: product.price, stock: product.stock, categoryId: product.categoryId,
    } : {},
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Product Name" placeholder="e.g. Fresh Apples 1kg"
        error={errors.name?.message} {...register('name')} />
      <Textarea label="Description" placeholder="Describe your product..."
        error={errors.description?.message} {...register('description')} />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Price (RM)" type="number" step="0.01" placeholder="0.00"
          error={errors.price?.message} {...register('price')} />
        <Input label="Stock Qty" type="number" placeholder="0"
          error={errors.stock?.message} {...register('stock')} />
      </div>

      <Select label="Category" error={errors.categoryId?.message} {...register('categoryId')}>
        <option value="">Select category</option>
        {allCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.parentId ? `  └ ${c.name}` : c.name}
          </option>
        ))}
      </Select>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Images (optional)</label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={24} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Click to upload images (max 5)</p>
          <input
            ref={fileRef} type="file" multiple accept="image/*" className="hidden"
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
          />
        </div>
        {images.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {images.map((f, i) => (
              <div key={i} className="relative">
                <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {product?.imageUrls?.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {product.imageUrls.map((url, i) => (
              <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
