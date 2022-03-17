import { Writable } from 'stream'
import { execa } from 'execa'
import { getRandomPort, waitForPort } from 'get-port-please'
import { useTestContext } from './context'

export async function startDevServer () {
  const ctx = useTestContext()
  const port = await getRandomPort()
  ctx.url = 'http://localhost:' + port

  let serverReadyResolve = () => {}
  const serverReadyPromise = new Promise<void>((resolve) => {
    serverReadyResolve = resolve
  })

  const stdout = new Writable({
    write (data, encoding, callback) {
      console.log({ out: data.toString() })
      if (data.toString().includes('Nitro built')) {
        serverReadyResolve()
      }
      callback()
    }
  })

  ctx.serverProcess = execa('npx', ['nuxi', 'dev'], {
    cwd: ctx.options.rootDir,
    env: {
      PORT: String(port),
      NODE_ENV: 'test'
    },
    stdio: 'pipe'
  })

  ctx.serverProcess.stdout.pipe(stdout)

  await waitForPort(port, { retries: 8 })

  await serverReadyPromise
}
