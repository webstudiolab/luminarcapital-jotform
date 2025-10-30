import { LOCALSTORAGE_EXPIRY } from '@/config/constants'

export const getFromLocalStorageWithExpiry = (key: string) => {
  const itemString = localStorage.getItem(key)

  if (!itemString) {
    return null
  }

  const item = JSON.parse(itemString)
  const now = new Date()
  if (item?.expiry && now.getTime() > item.expiry) {
    removeFromLocalStorage(key)
    return null
  }

  return item.data
}

export const setToLocalStorageWithExpiry = (
  key: string,
  data: unknown,
  ttl: number = LOCALSTORAGE_EXPIRY,
) => {
  const now = new Date()
  const item = {
    data: data,
    expiry: now.getTime() + ttl,
  }
  try {
    localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    console.error(`Error, LocalStorage - `, error)
  }
}

export const removeFromLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error, LocalStorage - `, error)
  }
}
