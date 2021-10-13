import { createHash } from 'crypto'

export function hashId (id: string) {
  return '$id_' + hash(id)
}

export function hash (input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .substr(0, length)
}

export function uniq<T> (arr: T[]): T[] {
  return Array.from(new Set(arr))
}

const IS_CSS_RE = /\.css(\?[^.]+)?$/
const IS_DEV_CSS_RE = /\.(?:css|scss|sass|postcss|less|stylus|styl)(\?[^.]+)?$/

export const MOCK_CSS_SUFFIX = '__nuxt_mock.css'

export function isCSS (file: string) {
  return IS_CSS_RE.test(file)
}

export function isDevCSS (file: string) {
  return IS_DEV_CSS_RE.test(file)
}

export function rewriteDevCSS (file: string) {
  if (file.endsWith('.css')) {
    return file
  }
  if (file.includes('?')) {
    return file + '&' + MOCK_CSS_SUFFIX
  }
  return file + '?' + MOCK_CSS_SUFFIX
}
