import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  categories: [],
  productCategories: [],
  loading: false,
  error: null,
}

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload
      state.loading = false
      state.error = null
    },
    setProductCategories: (state, action) => {
      state.productCategories = action.payload
      state.loading = false
      state.error = null
    },
    setCategoriesLoading: (state, action) => {
      state.loading = action.payload
    },
    setCategoriesError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    clearCategoriesError: (state) => {
      state.error = null
    },
  },
})

export const { 
  setCategories, 
  setProductCategories, 
  setCategoriesLoading, 
  setCategoriesError, 
  clearCategoriesError 
} = categorySlice.actions

// Selectors
export const selectCategories = (state) => state.categories.categories
export const selectProductCategories = (state) => state.categories.productCategories
export const selectCategoriesLoading = (state) => state.categories.loading
export const selectCategoriesError = (state) => state.categories.error

export default categorySlice.reducer
