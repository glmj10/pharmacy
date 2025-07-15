import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
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

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = authService.getStoredUser();

    if (token && user) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const apiResponse = await authService.login(credentials);
      
      // Backend chỉ trả về token trong login response
      // apiResponse = { status, message, data: { token }, timestamp }
      
      if (apiResponse && apiResponse.data && apiResponse.data.token) {
        // Lưu token
        localStorage.setItem('token', apiResponse.data.token);
        
        // Gọi API để lấy thông tin user
        const userResponse = await authService.getCurrentUser();
        
        if (userResponse && userResponse.data) {
          localStorage.setItem('user', JSON.stringify(userResponse.data));
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userResponse.data,
              token: apiResponse.data.token
            },
          });
        } else {
          // Nếu không lấy được user info, chỉ lưu token
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: null,
              token: apiResponse.data.token
            },
          });
        }
      } else {
        throw new Error('Invalid login response from server');
      }
      
      return apiResponse;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.register(userData);
      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const result = await authService.logout();
      if (result && result.message) {
        toast.success(result.message);
      }
    } catch (error) {
      // Bỏ qua lỗi logout vì đã xử lý trong authService
      console.log('Logout completed with cleanup');
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await userService.updateUser(userData);
      if (response && response.data) {
        // Update localStorage and state
        localStorage.setItem('user', JSON.stringify(response.data));
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data
        });
        return response;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
