import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.cartItems || [],
        totalPrice: action.payload.totalPrice || 0,
        loading: false,
      };
    case 'ADD_TO_CART':
      return {
        ...state,
        items: [...state.items, {
          id: action.payload.id,
          product: action.payload.product,
          quantity: action.payload.quantity,
          priceAtAddition: action.payload.priceAtAddition,
          priceDifferent: action.payload.priceDifferent,
          priceChangeType: action.payload.priceChangeType,
          selected: action.payload.selected,
          isOutOfStock: action.payload.isOutOfStock
        }],
        total: calculateTotal([...state.items, {
          id: action.payload.id,
          product: action.payload.product,
          quantity: action.payload.quantity,
          priceAtAddition: action.payload.priceAtAddition,
          priceDifferent: action.payload.priceDifferent,
          priceChangeType: action.payload.priceChangeType,
          selected: action.payload.selected,
          isOutOfStock: action.payload.isOutOfStock
        }]),
      };
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? {
              ...item,
              quantity: action.payload.quantity,
              priceAtAddition: action.payload.priceAtAddition ?? item.priceAtAddition,
              priceDifferent: action.payload.priceDifferent ?? item.priceDifferent,
              priceChangeType: action.payload.priceChangeType ?? item.priceChangeType,
              selected: action.payload.selected ?? item.selected,
              isOutOfStock: action.payload.isOutOfStock ?? item.isOutOfStock
            }
            : item
        ),
        total: calculateTotal(state.items.map(item =>
          item.id === action.payload.id
            ? {
              ...item,
              quantity: action.payload.quantity,
              priceAtAddition: action.payload.priceAtAddition ?? item.priceAtAddition,
              priceDifferent: action.payload.priceDifferent ?? item.priceDifferent,
              priceChangeType: action.payload.priceChangeType ?? item.priceChangeType,
              selected: action.payload.selected ?? item.selected,
              isOutOfStock: action.payload.isOutOfStock ?? item.isOutOfStock
            }
            : item
        )),
      };
    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        total: calculateTotal(filteredItems),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    // Sử dụng priceAtAddition nếu có, nếu không thì lấy priceNew từ product
    const price = item.priceAtAddition ?? item.product?.priceNew ?? 0;
    return total + (price * item.quantity);
  }, 0);
};

const initialState = {
  items: [],
  total: 0,
  loading: false,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await cartService.getCart();
      dispatch({ type: 'SET_CART', payload: response.data });
    } catch (error) {
      console.error('Error fetching cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartService.addToCart(productId, quantity);
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
      throw error;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      await cartService.updateCartItem(itemId, quantity);
      fetchCart();
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { id: itemId, quantity } });
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật giỏ hàng');
      throw error;
    }
  };

  const updateCartItemStatus = async (itemId, status) => {
    try {
      await cartService.updateCartItemStatus(itemId, status);
      fetchCart();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái chọn sản phẩm');
      throw error;
    }
  };
  const removeFromCart = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
      toast.success('Đã xóa khỏi giỏ hàng!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa khỏi giỏ hàng');
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Đã xóa toàn bộ giỏ hàng!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa toàn bộ giỏ hàng');
      throw error;
    }
  };

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const updateAllCartItemsStatus = async (status) => {
    try {
      await cartService.updateAllCartItemsStatus(status);
      fetchCart();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái chọn tất cả sản phẩm');
      throw error;
    }
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemCount,
    fetchCart,
    updateCartItemStatus,
    updateAllCartItemsStatus,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
