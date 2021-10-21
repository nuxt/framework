import { promises as fsp } from 'fs'
import { join, resolve } from 'pathe'
import { createApp, lazyHandle } from 'h3'
import type { PluginVisualizerOptions } from 'rollup-plugin-visualizer'
import { createServer } from '../utils/server'
import { writeTypes } from '../utils/prepare'
import { loadKit } from '../utils/kit'
import { clearDir } from '../utils/fs'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'analyze',
    usage: 'npx nuxi analyze [rootDir]',
    description: 'Analyze your nuxt app'
  },
  async invoke (args) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production'

    const rootDir = resolve(args._[0] || '.')
    const statsDir = join(rootDir, '.nuxt/stats')

    const { loadNuxt, buildNuxt } = await loadKit(rootDir)

    const analyzeOptions: PluginVisualizerOptions = {
      template: 'treemap',
      projectRoot: rootDir,
      filename: join(statsDir, '{name}.html')
    }

    const nuxt = await loadNuxt({
      rootDir,
      config: {
        analyze: analyzeOptions
      }
    })

    await clearDir(nuxt.options.buildDir)
    await writeTypes(nuxt)
    await buildNuxt(nuxt)

    const app = createApp()
    const server = createServer(app)

    const serveFile = (filePath: string) => lazyHandle(async () => {
      const contents = await fsp.readFile(filePath, 'utf-8')
      return (_req, res) => { res.end(contents) }
    })

    app.use('/client', serveFile(join(statsDir, 'client.html')))
    app.use('/nitro', serveFile(join(statsDir, 'nitro.html')))
    app.use(() => `
<ul>
<li>
  <a href="/client">Client bundle stats</a>
</li>
<li>
  <a href="/nitro">Nitro server bundle stats</a>
</li>
</ul>
    `)

    await server.listen()
  }
})
