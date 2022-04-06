import { joinURL } from 'ufo'
import { useConfig } from '#nitro'

export function baseURL (): string {
  return useConfig().app.baseURL
}

export function buildAssetsDir (): string {
  return useConfig().app.buildAssetsDir
}

export function buildAssetsURL (...path: string[]): string {
  return joinURL(publicAssetsURL(), useConfig().app.buildAssetsDir, ...path)
}

export function publicAssetsURL (...path: string[]): string {
  const publicBase = useConfig().app.cdnURL || useConfig().app.baseURL
  return path.length ? joinURL(publicBase, ...path) : publicBase
}
