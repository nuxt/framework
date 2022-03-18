import { useNuxt } from './context'
import { IncomingMessage, ServerResponse } from 'http'
import { Middleware } from 'h3'

export interface ServerMiddleware {
  path?: string,
  handler: Middleware | string
}

/** Adds a new server middleware to the end of the server middleware array. */
export function addServerMiddleware (middleware: ServerMiddleware) {
  useNuxt().options.serverMiddleware.push(middleware)
}
