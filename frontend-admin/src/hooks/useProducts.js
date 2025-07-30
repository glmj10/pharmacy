import { useState, useCallback } from 'react'
import productService from '../services/product.service'
import { useApiCall } from './useApiCall'

export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  })

  const { execute: callApi } = useApiCall()

  /**
   * Fetch products with pagination and filters
   */
  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const response = await callApi(() => productService.getProductsCMS(params))
      
      if (response.success && response.data) {
        const pageData = response.data
        
        setProducts(pageData.content || [])
        setPagination({
          currentPage: pageData.currentPage || 1,
          totalPages: pageData.totalPages || 0,
          totalElements: pageData.totalElements || 0,
          hasNext: pageData.hasNext || false,
          hasPrevious: pageData.hasPrevious || false,
        })
        
        return { success: true, data: pageData }
      }

      return { success: false, error: response.error }
    } catch (error) {
      console.error('Error fetching products:', error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [callApi])

  /**
   * Create new product
   */
  const createProduct = useCallback(async (formData) => {
    try {
      const response = await callApi(
        () => productService.createProduct(formData),
        {
          successMessage: 'Tạo sản phẩm thành công',
          showSuccessNotification: true,
        }
      )
      
      return response
    } catch (error) {
      console.error('Error creating product:', error)
      return { success: false, error }
    }
  }, [callApi])

  /**
   * Update existing product
   */
  const updateProduct = useCallback(async (id, formData) => {
    try {
      const response = await callApi(
        () => productService.updateProduct(id, formData),
        {
          successMessage: 'Cập nhật sản phẩm thành công',
          showSuccessNotification: true,
        }
      )
      
      return response
    } catch (error) {
      console.error('Error updating product:', error)
      return { success: false, error }
    }
  }, [callApi])

  /**
   * Delete product
   */
  const deleteProduct = useCallback(async (id) => {
    try {
      const response = await callApi(
        () => productService.deleteProduct(id),
        {
          successMessage: 'Xóa sản phẩm thành công',
          showSuccessNotification: true,
        }
      )
      
      return response
    } catch (error) {
      console.error('Error deleting product:', error)
      return { success: false, error }
    }
  }, [callApi])

  /**
   * Toggle product status
   */
  const toggleProductStatus = useCallback(async (id, currentStatus) => {
    try {
      const response = await callApi(
        () => productService.updateProductStatus(id, !currentStatus),
        {
          successMessage: 'Cập nhật trạng thái thành công',
          showSuccessNotification: true,
        }
      )
      
      return response
    } catch (error) {
      console.error('Error toggling product status:', error)
      return { success: false, error }
    }
  }, [callApi])

  /**
   * Get single product by ID
   */
  const getProductById = useCallback(async (id) => {
    try {
      const response = await callApi(() => productService.getProductById(id))
      
      if (response.success && response.data) {
        return { success: true, data: response.data.data }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      console.error('Error fetching product:', error)
      return { success: false, error }
    }
  }, [callApi])

  /**
   * Refresh current page
   */
  const refresh = useCallback(async (params = {}) => {
    return await fetchProducts({
      pageIndex: pagination.currentPage,
      pageSize: 10,
      ...params,
    })
  }, [fetchProducts, pagination.currentPage])

  return {
    // State
    products,
    loading,
    pagination,
    
    // Actions
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductById,
    refresh,
    
    // Utils
    setProducts,
    setPagination,
  }
}
