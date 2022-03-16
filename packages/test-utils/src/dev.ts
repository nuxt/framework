import { execa } from 'execa'
import { getRandomPort, waitForPort } from 'get-port-please'
import { useTestContext } from './context'

export async function startDevServer () {
  const ctx = useTestContext()

  const port = await getRandomPort()
  ctx.url = 'http://localhost:' + port
  ctx.serverProcess = execa('npx', ['nuxi', 'dev'], {
    cwd: ctx.nuxt.options.rootDir,
    env: {
      PORT: String(port),
      NODE_ENV: 'test'
    }
  })
  await waitForPort(port, { retries: 8 })
}
