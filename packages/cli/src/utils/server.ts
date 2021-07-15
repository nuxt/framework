import type { RequestListener } from 'http'
import { loading } from '@nuxt/design'

export function createServer () {
  const listener = createDynamicFunction(createLoadingHandler('Loading...'))

  async function listen (opts) {
    const { listen } = await import('listhen')
    return listen(listener.call, opts)
  }

  return {
    setApp: (app: RequestListener) => listener.set(app),
    listen
  }
}

export function createLoadingHandler (message: string): RequestListener {
  return (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.statusCode = 503 /* Service Unavailable */
    res.end(loading({ loading: message }))
  }
}

function createDynamicFunction<T extends (...args) => any>(initialValue: T) {
  let fn: T = initialValue
  return {
    set: (newFn: T) => { fn = newFn },
    call: ((...args) => fn(...args)) as T
  }
}
