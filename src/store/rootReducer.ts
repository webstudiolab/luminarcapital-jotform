import { combineReducers } from 'redux'
import postsReducer, { postsKey } from '@/store/slices/postsSlice'
import modalReducer, { modalsKey } from '@/store/slices/modalSlice'

const rootReducer = combineReducers({
  [postsKey]: postsReducer,
  [modalsKey]: modalReducer,
})

export default rootReducer
