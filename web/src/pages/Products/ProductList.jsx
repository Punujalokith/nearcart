import { useState } from 'react'
import { Plus, Pencil, Trash2, Image, Package, Search, AlertTriangle } from 'lucide-react'
import { useVendorProducts, useDeleteProduct } from '../../hooks/useProducts'
import { formatCurrency } from '../../lib/utils'
import { ProductForm } from './ProductForm'
import { Modal } from '../../components/ui/Modal'

export default function ProductList() {
  const { data: products = [], isLoading } = useVendorProducts()
  const deleteProduct = useDeleteProduct()
  const [showForm, setShowForm]       = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [search, setSearch]           = useState('')

  const handleEdit  = (p) => { setEditProduct(p); setShowForm(true) }
  const handleClose = ()  => { setShowForm(false); setEditProduct(null) }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''} in your store</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      {products.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Empty state */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No products yet</h3>
          <p className="text-gray-500 text-sm mt-1">Add your first product to start selling on NearCart</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-5 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition mx-auto"
          >
            <Plus size={16} /> Add Your First Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.imageUrls?.[0] ? (
                        <img src={p.imageUrls[0]} alt={p.name} className="w-11 h-11 rounded-xl object-cover border border-gray-100 shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                          <Image size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium">
                      {p.category?.name || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-5 py-4">
                    {p.stock === 0 ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                        <AlertTriangle size={11} /> Out of stock
                      </span>
                    ) : p.stock <= 5 ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                        <AlertTriangle size={11} /> Low — {p.stock} left
                      </span>
                    ) : (
                      <span className="text-sm text-gray-700 font-medium">{p.stock} units</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        disabled={deleteProduct.isPending}
                        onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteProduct.mutate(p.id) }}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && search && (
            <div className="text-center py-12 text-gray-500 text-sm">
              No products match "<strong>{search}</strong>"
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showForm} onClose={handleClose} title={editProduct ? 'Edit Product' : 'Add New Product'} size="lg">
        <ProductForm product={editProduct} onSuccess={handleClose} />
      </Modal>
    </div>
  )
}
