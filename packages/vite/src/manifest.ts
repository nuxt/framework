import fse from 'fs-extra'
import { resolve } from 'pathe'
import { withoutLeadingSlash, withoutTrailingSlash } from 'ufo'
import type { ViteBuildContext } from './vite'

export async function writeManifest (ctx: ViteBuildContext, extraEntries: string[] = []) {
  // Write client manifest for use in vue-bundle-renderer
  const clientDist = resolve(ctx.nuxt.options.buildDir, 'dist/client')
  const serverDist = resolve(ctx.nuxt.options.buildDir, 'dist/server')

  const entries = [
    '@vite/client',
    'entry.mjs',
    ...extraEntries
  ]

  // Legacy dev manifest
  const devClientManifest = {
    publicPath: ctx.nuxt.options.build.publicPath,
    all: entries,
    initial: entries,
    async: [],
    modules: {}
  }

  let clientManifest = ctx.nuxt.options.dev
    ? devClientManifest
    : await fse.readJSON(resolve(clientDist, 'manifest.json'))

  if (!ctx.nuxt.options.dev) {
    const assetsDir = withoutTrailingSlash(withoutLeadingSlash(ctx.nuxt.options.app.assetsPath))
    const publicPathRE = new RegExp(`^${assetsDir}/`)

    // Remove assetsDir prefix (`_nuxt`) inserted by vite
    clientManifest = Object.fromEntries(Object.entries(clientManifest).map(([key, value]) => {
      const entry: Record<string, any> = value
      for (const key of ['css', 'assets']) {
        if (key in entry) {
          entry[key] = entry[key].map(item => item.replace(publicPathRE, ''))
        }
      }
      return [key, entry]
    }))

    await fse.writeFile(resolve(clientDist, 'manifest.json'), JSON.stringify(clientManifest, null, 2), 'utf8')
  }

  await fse.mkdirp(serverDist)
  await fse.writeFile(resolve(serverDist, 'client.manifest.json'), JSON.stringify(clientManifest, null, 2), 'utf8')
  await fse.writeFile(resolve(serverDist, 'client.manifest.mjs'), 'export default ' + JSON.stringify(clientManifest, null, 2), 'utf8')
}
