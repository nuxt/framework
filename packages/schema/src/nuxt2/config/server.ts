import { defineUntypedSchema } from 'untyped'

export default defineUntypedSchema({
  server: {
    /**
    * Whether to enable HTTPS.
    *
    * @example
    * ```
    * import { fileURLToPath } from 'node:url'
    * export default {
    *   server: {
    *     https: {
    *       key: fs.readFileSync(fileURLToPath(new URL('./server.key', import.meta.url))),
    *       cert: fs.readFileSync(fileURLToPath(new URL('./server.crt', import.meta.url)))
    *     }
    *   }
    * }
    * ```
    *
    *
    * @type {false | { key: string; cert: string }}
    *
    */
    https: false,

    port: process.env.NUXT_PORT || process.env.PORT || process.env.npm_package_config_nuxt_port || 3000,

    host: process.env.NUXT_HOST || process.env.HOST || process.env.npm_package_config_nuxt_host || 'localhost',

    socket: process.env.UNIX_SOCKET || process.env.npm_package_config_unix_socket,

    /**
     * Enabling timing adds a middleware to measure the time elapsed during
     * server-side rendering and adds it to the headers as 'Server-Timing'.
     *
     * Apart from true/false, this can be an object for providing options.
     * Currently, only `total` is supported (which directly tracks the whole
     * time spent on server-side rendering.
     */
    timing: (val: any) => val ? ({ total: true, ...val }) : false,
  }
})
