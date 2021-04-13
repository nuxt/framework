import type { RequestListener } from 'http'

const defaultListener: RequestListener = (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.end('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="1"><head><body>...')
}

export function createServer () {
  const listener = createDynamicFunction(defaultListener)

  async function listen (opts) {
    const { listen } = await import('listhen')
    return listen(listener.call, opts)
  }

  return {
    setApp: (app: RequestListener = defaultListener) => listener.set(app),
    listen
  }
}

function createDynamicFunction<T extends (...args) => any>(initialValue: T) {
  let fn: T = initialValue
  return {
    set: (newFn: T) => { fn = newFn },
    call: ((...args) => fn(...args)) as T
  }
}
