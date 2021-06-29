import type { RequestListener } from 'http'
import { createApp } from 'h3'

export function createServer () {
  const app = createApp()

  async function listen (opts) {
    const { listen } = await import('listhen')
    return listen(app, opts)
  }

  return {
    app,
    listen
  }
}

export function createLoadingHandler (message: string, retryAfter = 60): RequestListener {
  return (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.statusCode = 503 /* Service Unavailable */
    res.setHeader('Retry-After', retryAfter)
    res.end(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="${retryAfter || 60}"><head><body>${message}`)
  }
}

export function createDynamicFunction<T extends (...args) => any>(initialValue: T) {
  let fn: T = initialValue
  return {
    set: (newFn: T) => { fn = newFn },
    call: ((...args) => fn(...args)) as T
  }
}
