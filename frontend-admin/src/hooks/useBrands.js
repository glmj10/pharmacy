import { useState, useCallback } from 'react'
import brandService from '../services/brand.service'
import { useApiCall } from './useApiCall'

/**
 * Custom hook for brand management operations
 */
export const useBrands = () => {
  const [brands, setBrands] = useState([])
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
   * Fetch brands with pagination and filters
   */
  const fetchBrands = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const response = await callApi(() => brandService.getBrands(params))
      
      if (response.success && response.data) {
        const pageData = response.data.data
        
        setBrands(pageData.content || [])
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
      console.error('Error fetching brands:', error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [callApi])

  /**
   * Get all brands without pagination
   */
  const getBrands = useCallback(async () => {
    try {
      const response = await callApi(() => brandService.getAllBrands())
      
      if (response.success && response.data) {
        return { success: true, data: response.data.data }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      console.error('Error fetching all brands:', error)
      return { success: false, error }
    }
  }, [callApi])

  /**
   * Create new brand
   */
  const createBrand = useCallback(async (brandData) => {
    try {
      const response = await callApi(
        () => brandService.createBrand(brandData),
        {
          successMessage: 'Tạo thương hiệu thành công',
          showSuccessNotification: true,
        }
      )
      
      return response
    } catch (error) {
      console.error('Error creating brand:', error)
      return { success: false, error }
    }
  }, [callApi])

  /**
   * Update existing brand
   */
  const updateBrand = useCallback(async (id, brandData) => {
    try {
      const response = await callApi(
        () => brandService.updateBrand(id, brandData),
        {
          successMessage: 'Cập nhật thương hiệu thành công',
          showSuccessNotification: true,
        }
      )
      
      return response
    } catch (error) {
      console.error('Error updating brand:', error)
      return { success: false, error }
    }
  }, [callApi])

  /**
   * Delete brand
   */
  const deleteBrand = useCallback(async (id) => {
    try {
      const response = await callApi(
        () => brandService.deleteBrand(id),
        {
          successMessage: 'Xóa thương hiệu thành công',
          showSuccessNotification: true,
        }
      )
      
      return response
    } catch (error) {
      console.error('Error deleting brand:', error)
      return { success: false, error }
    }
  }, [callApi])

  /**
   * Get single brand by ID
   */
  const getBrandById = useCallback(async (id) => {
    try {
      const response = await callApi(() => brandService.getBrandById(id))
      
      if (response.success && response.data) {
        return { success: true, data: response.data.data }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      console.error('Error fetching brand:', error)
      return { success: false, error }
    }
  }, [callApi])

  /**
   * Refresh current page
   */
  const refresh = useCallback(async (params = {}) => {
    return await fetchBrands({
      pageIndex: pagination.currentPage,
      pageSize: 10,
      ...params,
    })
  }, [fetchBrands, pagination.currentPage])

  return {
    // State
    brands,
    loading,
    pagination,
    
    // Actions
    fetchBrands,
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandById,
    refresh,
    
    // Utils
    setBrands,
    setPagination,
  }
}
