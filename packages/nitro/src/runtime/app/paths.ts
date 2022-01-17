import { joinURL } from 'ufo'
import config from '#config'

export function basePath () {
  return config.app.basePath
}

export function buildAssetsPath () {
  return config.app.buildAssetsPath
}

export function buildAssetsURL (...path: string[]) {
  return joinURL(publicAssetsURL(), config.app.buildAssetsPath, ...path)
}

export function publicAssetsURL (...path: string[]) {
  const publicBase = config.app.cdnURL || config.app.basePath
  return path.length ? joinURL(publicBase, ...path) : publicBase
}
