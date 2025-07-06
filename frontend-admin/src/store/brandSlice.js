import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  brands: [],
  loading: false,
  error: null,
}

const brandSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    setBrands: (state, action) => {
      state.brands = action.payload
      state.loading = false
      state.error = null
    },
    setBrandsLoading: (state, action) => {
      state.loading = action.payload
    },
    setBrandsError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    clearBrandsError: (state) => {
      state.error = null
    },
  },
})

export const { setBrands, setBrandsLoading, setBrandsError, clearBrandsError } = brandSlice.actions

// Selectors
export const selectBrands = (state) => state.brands.brands
export const selectBrandsLoading = (state) => state.brands.loading
export const selectBrandsError = (state) => state.brands.error

export default brandSlice.reducer
