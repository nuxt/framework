import consola from 'consola'
import jiti from 'jiti'
import { useNuxt } from '../nuxt'

const _require = jiti(process.cwd())

export async function installModule (moduleOpts) {
  const nuxt = useNuxt()

  let src
  let options: Record<string, any>
  let handler

  // Type 1: String or Function
  if (typeof moduleOpts === 'string' || typeof moduleOpts === 'function') {
    src = moduleOpts
  } else if (Array.isArray(moduleOpts)) {
    // Type 2: Babel style array
    [src, options] = moduleOpts
  } else if (typeof moduleOpts === 'object') {
    // Type 3: Pure object
    ({ src, options, handler } = moduleOpts)
  }

  // Define handler if src is a function
  if (src instanceof Function) {
    handler = src
  }

  // Prevent adding buildModules-listed entries in production
  if (nuxt.options.buildModules.includes(handler) && nuxt.options._start) {
    return
  }

  // Resolve handler
  if (!handler && typeof src === 'string') {
    handler = _require(src)
  }

  // Validate handler
  if (typeof handler !== 'function') {
    throw new TypeError('Module should export a function: ' + src)
  }

  // Ensure module is required once
  if ('meta' in handler && typeof src === 'string') {
    const metaKey = handler.meta && handler.meta.name
    const key = metaKey || src
    if (typeof key === 'string') {
      if (nuxt.options._requiredModules[key]) {
        if (!metaKey) {
          // TODO: Skip with nuxt3
          consola.warn('Modules should be only specified once:', key)
        } else {
          return
        }
      }
      nuxt.options._requiredModules[key] = { src, options, handler }
    }
  }

  // Default module options to empty object
  if (options === undefined) {
    options = {}
  }

  const result = await handler.call(this, options)
  return result
}
