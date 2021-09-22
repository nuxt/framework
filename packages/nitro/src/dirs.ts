import { resolve } from 'pathe'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)

export const distDir = resolve(__dirname)
export const pkgDir = resolve(__dirname, '..')
export const runtimeDir = resolve(distDir, 'runtime')
