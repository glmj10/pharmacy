import { useState, useCallback } from 'react'
import categoryService from '../services/category.service'
import { useApiCall } from './useApiCall'

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  })

  const { execute: callApi } = useApiCall()

  const fetchCategories = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const response = await callApi(() => categoryService.getCategories(params))
      
      if (response.success && response.data) {
        const pageData = response.data.data
        
        setCategories(pageData.content || [])
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
      console.error('Error fetching categories:', error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [callApi])

  const getCategories = useCallback(async () => {
    try {
      const response = await callApi(() => categoryService.getAllCategories())
      
      if (response.success && response.data) {
        return { success: true, data: response.data.data }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      console.error('Error fetching all categories:', error)
      return { success: false, error }
    }
  }, [callApi])

  const getProductCategories = useCallback(async () => {
    try {
      const response = await callApi(() => categoryService.getProductCategories())
      
      if (response.success && response.data) {
        return { success: true, data: response.data.data }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      console.error('Error fetching product categories:', error)
      return { success: false, error }
    }
  }, [callApi])

  const createCategory = useCallback(async (categoryData) => {
    try {
      const response = await callApi(
        () => categoryService.createCategory(categoryData),
        {
          successMessage: 'Tạo danh mục thành công',
          showSuccessNotification: true,
        }
      )
      
      return response
    } catch (error) {
      console.error('Error creating category:', error)
      return { success: false, error }
    }
  }, [callApi])

  const updateCategory = useCallback(async (id, categoryData) => {
    try {
      const response = await callApi(
        () => categoryService.updateCategory(id, categoryData),
        {
          successMessage: 'Cập nhật danh mục thành công',
          showSuccessNotification: true,
        }
      )
      
      return response
    } catch (error) {
      console.error('Error updating category:', error)
      return { success: false, error }
    }
  }, [callApi])

  const deleteCategory = useCallback(async (id) => {
    try {
      const response = await callApi(
        () => categoryService.deleteCategory(id),
        {
          successMessage: 'Xóa danh mục thành công',
          showSuccessNotification: true,
        }
      )
      
      return response
    } catch (error) {
      console.error('Error deleting category:', error)
      return { success: false, error }
    }
  }, [callApi])

  const getCategoryById = useCallback(async (id) => {
    try {
      const response = await callApi(() => categoryService.getCategoryById(id))
      
      if (response.success && response.data) {
        return { success: true, data: response.data.data }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      console.error('Error fetching category:', error)
      return { success: false, error }
    }
  }, [callApi])

  const refresh = useCallback(async (params = {}) => {
    return await fetchCategories({
      pageIndex: pagination.currentPage,
      pageSize: 10,
      ...params,
    })
  }, [fetchCategories, pagination.currentPage])

  return {
    // State
    categories,
    loading,
    pagination,
    
    // Actions
    fetchCategories,
    getCategories,
    getProductCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    refresh,
    
    // Utils
    setCategories,
    setPagination,
  }
}
