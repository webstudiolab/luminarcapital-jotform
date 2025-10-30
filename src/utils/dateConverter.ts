export const dateConverter = (date: string) => {
  const dateObj = new Date(date)

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  return dateObj.toLocaleDateString('en-US', options)
}
