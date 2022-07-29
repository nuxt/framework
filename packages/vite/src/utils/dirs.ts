import { fileURLToPath } from 'node:url'
import { resolve } from 'pathe'

export const distDir = resolve(fileURLToPath(import.meta.url), '../..')
export const pkgDir = resolve(distDir, '..')
