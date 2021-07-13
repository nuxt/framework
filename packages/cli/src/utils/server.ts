import type { RequestListener } from 'http'
import { template as loadingTemplate } from '@nuxt/design/dist/templates/loading'

export function createServer () {
  const listener = createDynamicFunction(createLoadingHandler('Loading...', 1))

  async function listen (opts) {
    const { listen } = await import('listhen')
    return listen(listener.call, opts)
  }

  return {
    setApp: (app: RequestListener) => listener.set(app),
    listen
  }
}

export function createLoadingHandler (message: string, retryAfter = 60): RequestListener {
  return (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.statusCode = 503 /* Service Unavailable */
    res.setHeader('Retry-After', retryAfter)
    res.end(loadingTemplate({
      retryAfter,
      loading: 'Loading',
      loading_message: message
    }))
  }
}

function createDynamicFunction<T extends (...args) => any>(initialValue: T) {
  let fn: T = initialValue
  return {
    set: (newFn: T) => { fn = newFn },
    call: ((...args) => fn(...args)) as T
  }
}
