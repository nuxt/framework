import { resolve } from 'pathe'
import { createCommonJS } from 'mlly'

const cjs = createCommonJS(import.meta.url)

export const distDir = cjs.__dirname
export const pkgDir = resolve(distDir, '..')
