export const useConvertPropToPixels = (prop: string): number => {
  const tempDiv = document.createElement('div')

  tempDiv.style.position = 'absolute'
  tempDiv.style.opacity = '0'
  tempDiv.style.height = getComputedStyle(document.documentElement).getPropertyValue(prop)

  document.body.appendChild(tempDiv)

  const pixels = parseInt(getComputedStyle(tempDiv).height)

  document.body.removeChild(tempDiv)

  return pixels
}

export const useScrollToHeading = (id: string, scrollMarginCssVar: string) => {
  // Use replaceState to prevent page jump when adding hash
  history.replaceState({}, '', '#' + id)

  // Do not remove setTimeout (does not work in Safari)
  setTimeout(() => {
    const escapedId = id.replace(/\./g, '\\.')

    const heading = document.querySelector(`#${escapedId}`) as any

    const offset = heading.offsetTop - useConvertPropToPixels(scrollMarginCssVar)

    window.scrollTo({
      top: offset,
      left: 0,
      behavior: 'smooth'
    })
  })
}
