import { createTest, exposeContextToEnv } from '@nuxt/test-utils'

const options = JSON.parse(process.env.NUXT_TEST_OPTIONS || '{}')
const hooks = createTest(options)

export const setup = async () => {
  await hooks.setup()
  exposeContextToEnv()
}

export const teardown = async () => {
  await hooks.afterAll()
}
