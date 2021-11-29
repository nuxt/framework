import { CreateOptions } from '#app'

const entry = process.server
  /* @ts-expect-error mjs is not recognized */
  ? (ctx?: CreateOptions['ssrContext']) => import('./bootstrap.mjs').then(m => m.default(ctx))
  /* @ts-expect-error mjs is not recognized */
  : () => import('./bootstrap.mjs').then(m => m.default)

if (process.client) {
  entry()
}

export default entry
