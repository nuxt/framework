import type { Plugin } from 'vite'
import { MOCK_CSS_SUFFIX } from '../utils'

// For SSR renderer to treat preprocessors as css,
// we need to append the `.css` in manifest, and then write them back on serving.
export function mockCSSRewritePlugin () {
  return <Plugin> {
    name: 'nuxt:mock-css-rewrite',
    enforce: 'pre',
    configureServer (server) {
      server.middlewares.use((req, _, next) => {
        if (req.url.endsWith(MOCK_CSS_SUFFIX)) {
          req.url = req.url.slice(0, -MOCK_CSS_SUFFIX.length - 1)
        }
        next()
      })
    }
  }
}
