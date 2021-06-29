import { resolve } from 'path'
import { createApp, lazyHandle } from 'h3'
import type { UserConfig } from 'vite'
import type { DevtoolsContext, DevtoolsService } from './types'

export function createDevtoolsService () {
  // Devtools context
  const ctx: DevtoolsContext = {
    state: {}
  }

  // Create a h3 stack
  const app = createApp()

  // Register devtools UI
  app.useAsync('/ui', createUI(ctx))

  // Helper to replace nuxt instance
  const setNuxt = (nuxt) => { ctx.nuxt = nuxt }

  // Helper to register a service
  const addService = (service: DevtoolsService) => {
    // Register service actions
    for (const actionName in service.actions) {
      app.useAsync(`/api/${service.name}/${actionName}`, async (req) => {
        const result = await service.actions[actionName]({ req }, ctx)
        return result
      })
    }
  }

  return {
    ctx,
    app,
    setNuxt,
    addService
  }
}

function createUI (_ctx: DevtoolsContext) {
  return lazyHandle(async () => {
    const serveStatic = await import('serve-static')
    console.log(Object.keys(serveStatic))
    return serveStatic(resolve(__dirname, 'ui'), {}) as any
  })
}

function createDevUI (_ctx: DevtoolsContext) {
  const base = '/_devtools/ui/'
  const viteMiddleware = lazyHandle(async () => {
    const { createServer } = await import('vite')
    const viteConfig = await import('../vite.config').then(r => r.default) as UserConfig
    const viteServer = await createServer({
      ...viteConfig,
      base
    })
    return viteServer.middlewares
  })

  const HtmlTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <base href="${base}">
    <title>Nuxt Devtools</title>
  </head>
  <body>
    <div id="app"></div>
    <script2 type="module" src="@vite/client"></script2>
    <script type="module" src="./main.ts"></script>
  </body>
</html>`

  return async (req, res) => {
    if (req.url === '/') {
      return HtmlTemplate
    }
    return viteMiddleware
  }
}
