import { resolve } from 'pathe'
import { createCommonJS } from 'mlly'

const cjs = createCommonJS(import.meta.url)

export const distDir = resolve(cjs.__dirname)
export const pkgDir = resolve(cjs.__dirname, '..')
export const runtimeDir = resolve(distDir, 'runtime')
