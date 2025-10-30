export const scrollTo = (elementId: string) => {
  const elementDOM = document.getElementById(elementId)
  const header = document.getElementById('header')

  if (elementDOM && header) {
    const space = 16
    const elementY = elementDOM.getBoundingClientRect().top
    const headerHeight = header.getBoundingClientRect().height

    const y = elementY + window.scrollY - headerHeight - space

    window.scrollTo({ top: y, behavior: 'smooth' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
