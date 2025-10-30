import { createSlice } from '@reduxjs/toolkit'
import { IModalPayload, IModalState } from '@/types'

const initialState: IModalState = {
  isOpen: false,
  modal: null,
  size: 'lg',
}

export const modalsKey = 'Modals'

export const modalSlice = createSlice({
  name: modalsKey,
  initialState,
  reducers: {
    openModal: (state: IModalState, action: { payload: IModalPayload }) => {
      state.isOpen = true
      state.modal = action.payload.modal
      state.size = action.payload.size
    },
    closeModal: (state: IModalState) => {
      state.isOpen = false
      state.modal = null
      state.size = 'lg'
    },
  },
})

export const { openModal, closeModal } = modalSlice.actions

export const selectModal = (state: { [key: string]: unknown }) =>
  state[modalsKey]

export default modalSlice.reducer
