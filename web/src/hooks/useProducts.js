import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export function useVendorProducts() {
  return useQuery({
    queryKey: ['vendor-products'],
    queryFn: async () => {
      const me = await api.get('/vendors/me')
      const res = await api.get('/products', { params: { vendorId: me.data.id, limit: 100 } })
      return res.data.data
    },
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/products', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-products'] }); toast.success('Product created!') },
    onError:   (e) => toast.error(e.response?.data?.error || 'Failed to create product'),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/products/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-products'] }); toast.success('Product updated!') },
    onError:   (e) => toast.error(e.response?.data?.error || 'Failed to update product'),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-products'] }); toast.success('Product deleted') },
    onError:   (e) => toast.error(e.response?.data?.error || 'Failed to delete'),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn:  async () => { const res = await api.get('/categories'); return res.data },
  })
}

export function useUploadImages() {
  return useMutation({
    mutationFn: async ({ productId, files }) => {
      const fd = new FormData()
      files.forEach((f) => fd.append('images', f))
      return api.post(`/products/${productId}/images`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => toast.success('Images uploaded!'),
    onError:   (e) => toast.error(e.response?.data?.error || 'Upload failed'),
  })
}
