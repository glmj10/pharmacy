import { useState, useCallback } from 'react'
import { orderService } from '../services'
import { useApiCall } from './useApiCall'

export const useOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    size: 10
  })

  const { execute: callApi } = useApiCall()

  const getOrders = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = {
        pageIndex: params.pageIndex || 1, // Backend expects 1-based indexing
        pageSize: params.pageSize || 10,
      }
      
      // Add filter parameters only if they exist
      if (params.id) {
        queryParams.id = params.id
      }
      if (params.orderStatus) {
        queryParams.orderStatus = params.orderStatus
      }
      if (params.paymentStatus) {
        queryParams.paymentStatus = params.paymentStatus
      }
      if (params.customerPhoneNumber) {
        queryParams.customerPhoneNumber = params.customerPhoneNumber
      }
      if (params.fromDate) {
        queryParams.fromDate = params.fromDate
      }
      if (params.toDate) {
        queryParams.toDate = params.toDate
      }
      
      const response = await callApi(() => orderService.getOrders(queryParams))
      if (response.success) {
        const orders = response.data.content || []
        setOrders(orders)
        setPagination({
          currentPage: params.pageIndex || 1,
          totalPages: response.data.totalPages || 0,
          totalElements: response.data.totalElements || 0,
          size: response.data.size || 10
        })
        return response
      } else {
        throw new Error(response.message || 'Failed to fetch orders')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching orders')
      setOrders([])
      throw err
    } finally {
      setLoading(false)
    }
  }, [callApi])

  const getOrderDetails = useCallback(async (orderId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await callApi(() => orderService.getOrderDetails(orderId))
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch order details')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching order details')
      throw err
    } finally {
      setLoading(false)
    }
  }, [callApi])

  const updateOrderStatus = useCallback(async (orderId, status) => {
    setLoading(true)
    setError(null)
    try {
      const response = await callApi(() => orderService.updateOrderStatus(orderId, status))
      
      if (response.success) {
        // Update the order in the local state
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: status }
            : order
        ))
        return response
      } else {
        throw new Error(response.message || 'Failed to update order status')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating order status')
      throw err
    } finally {
      setLoading(false)
    }
  }, [callApi])

  const updatePaymentStatus = useCallback(async (orderId, paymentStatus) => {
    setLoading(true)
    setError(null)
    try {
      const response = await callApi(() => orderService.updatePaymentStatus(orderId, paymentStatus))
      
      if (response.success) {
        // Update the order in the local state
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, paymentStatus: paymentStatus }
            : order
        ))
        return response
      } else {
        throw new Error(response.message || 'Failed to update payment status')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating payment status')
      throw err
    } finally {
      setLoading(false)
    }
  }, [callApi])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    orders,
    loading,
    error,
    pagination,
    
    // Actions
    getOrders,
    getOrderDetails,
    updateOrderStatus,
    updatePaymentStatus,
    clearError,

    // Helper getters
    hasOrders: orders.length > 0,
    isEmpty: !loading && orders.length === 0,
  }
}
