import { relative, resolve } from 'pathe'
import consola from 'consola'
import { extendPreset, writeFile, prettyPath, hl } from '../utils'
import { NitroContext, NitroPreset } from '../context'
import { worker } from './worker'

export const cloudflare: NitroPreset = extendPreset(worker, {
  entry: '{{ _internal.runtimeDir }}/entries/cloudflare',
  ignore: [
    'wrangler.toml'
  ],
  previewCommand: config => `npx miniflare ${relative(config.output.dir, config.output.serverDir)}/index.mjs --site ${relative(config.output.dir, config.output.publicDir)}`,
  hooks: {
    async 'nitro:compiled' ({ output, _nuxt }: NitroContext) {
      await writeFile(resolve(output.dir, 'package.json'), JSON.stringify({ private: true, main: './server/index.mjs' }, null, 2))
      await writeFile(resolve(output.dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 1 }, null, 2))
      let inDir = prettyPath(_nuxt.rootDir)
      if (inDir) {
        inDir = 'in ' + inDir
      }
      consola.success('Ready to run', hl('npx wrangler publish ' + inDir), 'or', hl('npx miniflare ' + prettyPath(output.serverDir) + '/index.mjs --site ' + prettyPath(output.publicDir)), 'for local testing')
    }
  }
})
