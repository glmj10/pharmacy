import { setBrands, setBrandsLoading, setBrandsError } from './brandSlice'
import { setProductCategories, setCategoriesLoading, setCategoriesError } from './categorySlice'
import brandService from '../services/brand.service'
import categoryService from '../services/category.service'

// Brand actions
export const fetchBrands = () => async (dispatch) => {
  try {
    dispatch(setBrandsLoading(true))
    const response = await brandService.getAllBrands()
    
    if (response.success && response.data) {
      dispatch(setBrands(response.data.data || []))
    } else {
      dispatch(setBrandsError(response.error || 'Không thể tải danh sách thương hiệu'))
    }
  } catch (error) {
    console.error('Error fetching brands:', error)
    dispatch(setBrandsError('Không thể tải danh sách thương hiệu'))
  }
}

// Category actions
export const fetchProductCategories = () => async (dispatch) => {
  try {
    dispatch(setCategoriesLoading(true))
    const response = await categoryService.getProductCategories()
    
    if (response.success && response.data) {
      dispatch(setProductCategories(response.data.data || []))
    } else {
      dispatch(setCategoriesError(response.error || 'Không thể tải danh sách danh mục'))
    }
  } catch (error) {
    console.error('Error fetching product categories:', error)
    dispatch(setCategoriesError('Không thể tải danh sách danh mục'))
  }
}
