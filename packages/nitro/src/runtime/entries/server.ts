import '#polyfill'
import { Server as HttpServer } from 'http'
import { Server as HttpsServer } from 'https'
import destr from 'destr'
import { handle } from '../server'
import { baseURL } from '#paths'

const cert = process.env.NITRO_SSL_CERT
const key = process.env.NITRO_SSL_KEY

const server = cert && key ? new HttpsServer({ key, cert }, handle) : new HttpServer(handle)

const port = (destr(process.env.NUXT_PORT || process.env.PORT) || 3000) as number
const hostname = process.env.NUXT_HOST || process.env.HOST || 'localhost'

if (process.env.NITRO_TIMEOUT) {
  server.timeout = destr(process.env.NITRO_TIMEOUT) as number
}
if (process.env.NITRO_KEEP_ALIVE_TIMEOUT) {
  server.keepAliveTimeout = destr(process.env.NITRO_KEEP_ALIVE_TIMEOUT) as number
}
if (process.env.NITRO_HEADERS_TIMEOUT) {
  server.headersTimeout = destr(process.env.NITRO_HEADERS_TIMEOUT) as number
}

// @ts-ignore
server.listen(port, hostname, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  const protocol = cert && key ? 'https' : 'http'
  console.log(`Listening on ${protocol}://${hostname}:${port}${baseURL()}`)
})

export default {}
