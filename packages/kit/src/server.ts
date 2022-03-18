import { useNuxt } from './context'
import { IncomingMessage, ServerResponse } from 'http'

export interface ServerMiddleware {
  path: string,
  handler: (req: IncomingMessage, res: ServerResponse) => void
}

/** Adds a new server middleware to the end of the server middleware array. */
export function addServerMiddleware (middleware: ServerMiddleware) {
  useNuxt().options.serverMiddleware.push(middleware)
}
