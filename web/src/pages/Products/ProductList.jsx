import { useState } from 'react'
import { Plus, Pencil, Trash2, Image } from 'lucide-react'
import { useVendorProducts, useDeleteProduct } from '../../hooks/useProducts'
import { Button } from '../../components/ui/Button'
import { formatCurrency } from '../../lib/utils'
import { ProductForm } from './ProductForm'
import { Modal } from '../../components/ui/Modal'

export default function ProductList() {
  const { data: products = [], isLoading } = useVendorProducts()
  const deleteProduct = useDeleteProduct()
  const [showForm, setShowForm]     = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  const handleEdit = (product) => { setEditProduct(product); setShowForm(true) }
  const handleClose = () => { setShowForm(false); setEditProduct(null) }

  if (isLoading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">{products.length} product{products.length !== 1 ? 's' : ''} in your store</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={18} /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
          <p className="text-gray-500 mt-1">Add your first product to start selling</p>
          <Button onClick={() => setShowForm(true)} className="mt-4 gap-2">
            <Plus size={18} /> Add Product
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.imageUrls?.[0] ? (
                        <img src={p.imageUrls[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Image size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.category?.name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(p.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${p.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {p.stock} {p.stock <= 5 && p.stock > 0 ? '(low)' : p.stock === 0 ? '(out)' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} className="gap-1">
                        <Pencil size={14} /> Edit
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className="gap-1 text-red-600 hover:bg-red-50"
                        loading={deleteProduct.isPending}
                        onClick={() => { if (confirm('Delete this product?')) deleteProduct.mutate(p.id) }}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showForm} onClose={handleClose} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <ProductForm product={editProduct} onSuccess={handleClose} />
      </Modal>
    </div>
  )
}

function Package({ size, className }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
}
