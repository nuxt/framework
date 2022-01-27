export const escapeRE = (str: string) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
