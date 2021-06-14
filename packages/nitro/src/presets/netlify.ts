import { join } from 'upath'
import { existsSync, readFile, writeFile } from 'fs-extra'
import { extendPreset } from '../utils'
import { NitroContext, NitroPreset } from '../context'
import { lambda } from './lambda'

export const netlify: NitroPreset = extendPreset(lambda, {
  output: {
    dir: '{{ _nuxt.rootDir }}/netlify/functions',
    publicDir: '{{ _nuxt.rootDir }}/dist'
  },
  hooks: {
    async 'nitro:compiled' (ctx: NitroContext) {
      const redirectsPath = join(ctx._nuxt.rootDir, '_redirects')
      let contents = '/* /.netlify/functions/server 200'
      if (existsSync(redirectsPath)) {
        const currentRedirects = await readFile(redirectsPath, 'utf-8')
        if (currentRedirects.match(/^\/\* /m)) {
          // Not adding Nitro fallback as an existing fallback rule was found
          contents = currentRedirects
        } else {
          contents = currentRedirects + '\n' + contents
        }
      }
      await writeFile(redirectsPath, contents)
    }
  },
  ignore: [
    'netlify.toml',
    '_redirects'
  ]
})

// eslint-disable-next-line
export const netlify_builder: NitroPreset = extendPreset(netlify, {
  entry: '{{ _internal.runtimeDir }}/entries/netlify_builder'
})
