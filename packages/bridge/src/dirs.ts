import { fileURLToPath } from 'url'
import { dirname, resolve } from 'pathe'

// Assuming dirs goes to dist/chunks
export const distDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const pkgDir = resolve(distDir, '..')
