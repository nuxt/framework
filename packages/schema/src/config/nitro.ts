import { defineUntypedSchema } from 'untyped'

export default defineUntypedSchema({
  /**
   * Configuration for Nitro.
   *
   * @see https://nitro.unjs.io/config/
   *
   * @type {typeof import('nitropack')['NitroConfig']}
   * @version 2
   * @version 3
   */
  nitro: {},

  /**
   * Nitro server handlers.
   *
   * Each handler admits the following options:
   * - handler: The path to the file defining the handler.
   * - route: The route under which the handler is available. This follows the conventions of https://github.com/unjs/radix3.
   * - method: The kind of requests (`GET`, `POST`, ...) that should be handled.
   * - middleware: Specifies this is a middleware handler.
   * - lazy: Specifies to use lazy loading to import the handler.
   *
   * @see https://v3.nuxtjs.org/guide/features/server-routes
   *
   * @note Files from `server/api`, `server/middleware` and `server/routes` will be automatically registred by Nuxt.
   *
   * @example
   * ```js
   * serverHandlers: [
   *   { route: '/path/foo/**:name', handler: '~/server/foohandler.ts' }
   * ]
   * ```
   *
   * @type {typeof import('nitropack')['NitroEventHandler'][]}
   * @version 3
   */
  serverHandlers: [],

  /**
   * Nitro development-only server handlers.
   *
   * @see https://nitro.unjs.io/guide/introduction/routing
   *
   * @type {typeof import('nitropack')['NitroDevEventHandler'][]}
   * @version 3
   */
  devServerHandlers: []
})
