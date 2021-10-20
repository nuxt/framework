import '#polyfill'
import { Server } from 'http'
import { tmpdir } from 'os'
import { join } from 'path'
import { mkdirSync } from 'fs'
import { threadId, parentPort } from 'worker_threads'
// import type { AddressInfo } from 'net'
import { handle } from '../server'

const server = new Server(handle)

const socketDir = join(tmpdir(), 'nitro')
mkdirSync(socketDir, { recursive: true })
const socketPath = join(socketDir, `worker-${process.pid}-${threadId}.sock`)
server.listen(socketPath, () => {
  parentPort.postMessage({ event: 'listen', address: { socketPath } })
})
