export async function registerModules () {
  // Call before hook
  await this.nuxt.callHook('modules:before', this, this.options.modules)

  if (this.options.buildModules && !this.options._start) {
    // Load every devModule in sequence
    await sequence(this.options.buildModules, this.addModule)
  }

  // Load every module in sequence
  await sequence(this.options.modules, this.addModule)

  // Load ah-hoc modules last
  await sequence(this.options._modules, this.addModule)

  // Call done hook
  await this.nuxt.callHook('modules:done', this)
}

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
    try {
      handler = nuxt.nuxt.resolver.requireModule(src, { useESM: true })
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        throw error
      }

      // Hint only if entrypoint is not found and src is not local alias or path
      if (error.message.includes(src) && !/^[~.]|^@\//.test(src)) {
        let message = 'Module `{name}` not found.'

        if (nuxt.options.buildModules.includes(src)) {
          message += ' Please ensure `{name}` is in `devDependencies` and installed. HINT: During build step, for npm/yarn, `NODE_ENV=production` or `--production` should NOT be used.'.replace('{name}', src)
        } else if (nuxt.options.modules.includes(src)) {
          message += ' Please ensure `{name}` is in `dependencies` and installed.'
        }

        message = message.replace(/{name}/g, src)

        consola.warn(message)
      }

      if (nuxt.options._cli) {
        throw error
      } else {
        // TODO: Remove in next major version
        consola.warn('Silently ignoring module as programatic usage detected.')
        return
      }
    }
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
      if (nuxt.requiredModules[key]) {
        if (!metaKey) {
          // TODO: Skip with nuxt3
          consola.warn('Modules should be only specified once:', key)
        } else {
          return
        }
      }
      nuxt.requiredModules[key] = { src, options, handler }
    }
  }

  // Default module options to empty object
  if (options === undefined) {
    options = {}
  }
  const result = await handler.call(this, options)
  return result
}
