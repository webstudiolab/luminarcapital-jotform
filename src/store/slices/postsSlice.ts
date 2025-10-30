import {
  QUERY_PARAMETERS,
  STATUS,
  WORDPRESS_API_PATHS,
} from '@/config/constants'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { IFetchPosts, IPageInfo, IPostsState } from '@/types'
import axios from 'axios'

const initialState: IPostsState = {
  data: {
    nodes: [],
    pageInfo: {} as IPageInfo,
  },
  status: STATUS.IDLE,
  error: null,
  filter: {
    categories: null,
    page: 1,
    per_page: QUERY_PARAMETERS.LIMIT,
    order: null,
    order_by: null,
  },
}

export const postsKey = 'Posts'

export const fetchPosts = createAsyncThunk(
  `${postsKey}/fetch`,
  async ({
    categories,
    page,
    per_page = QUERY_PARAMETERS.LIMIT,
    order,
    order_by,
  }: IFetchPosts) => {
    const { data, headers } = await axios.get(
      `${process.env.WORDPRESS_API_URL!}/${WORDPRESS_API_PATHS.fetch}/posts`,
      { params: { page, per_page, categories, order_by, order } },
    )

    return {
      nodes: data,
      pageInfo: {
        total: Number(headers['x-wp-total']),
        totalPages: Number(headers['x-wp-totalpages']),
      },
    }
  },
)

export const postsSlice = createSlice({
  name: postsKey,
  initialState,
  reducers: {
    setCategory: (state: IPostsState, action) => {
      state.filter = {
        ...state.filter,
        categories: action.payload,
        page: 1,
        order: null,
        order_by: null,
      }
    },
    setPage: (state: IPostsState, action) => {
      state.filter = { ...state.filter, page: action.payload }
    },
    setOrder: (state: IPostsState, action) => {
      state.filter = {
        ...state.filter,
        page: 1,
        categories: null,
        order: action.payload.order,
        order_by: action.payload.order_by,
      }
    },
    resetFilter: (state: IPostsState) => {
      state.filter = {
        ...state.filter,
        page: 1,
        categories: null,
        order: null,
        order_by: null,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state: IPostsState) => {
        state.status = STATUS.PENDING
        state.error = null
        state.data = { nodes: [], pageInfo: {} as IPageInfo }
      })
      .addCase(fetchPosts.fulfilled, (state: IPostsState, action) => {
        state.status = STATUS.FULFILLED
        state.data = action.payload
      })
      .addCase(fetchPosts.rejected, (state: IPostsState, action) => {
        state.data = { nodes: [], pageInfo: {} as IPageInfo }
        state.error = action.payload
        state.status = STATUS.REJECTED
      })
  },
})

export const { setCategory, setPage, setOrder, resetFilter } =
  postsSlice.actions

export const selectPosts = (state: { [key: string]: unknown }) =>
  state[postsKey]

export default postsSlice.reducer
