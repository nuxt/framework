import { resolve } from 'pathe'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)

export const distDir = __dirname
export const pkgDir = resolve(distDir, '..')
