// eslint-disable-next-line no-unused-vars
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
  // eslint-disable-next-line no-unused-vars
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}
