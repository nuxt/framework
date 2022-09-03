import { pathToFileURL } from 'node:url'
import { Plugin } from 'vite'
import { findStaticImports } from 'mlly'
import { dirname, relative } from 'pathe'
import { genObjectFromRawEntries } from 'knitwork'
import { filename } from 'pathe/utils'
import { parseQuery, parseURL } from 'ufo'
import { isCSS } from '../utils'

interface SSRStylePluginOptions {
  srcDir: string
  shouldInline?: (id?: string) => boolean
}

export function ssrStylePlugin (options: SSRStylePluginOptions): Plugin {
  const cssMap: Record<string, string[]> = {}
  const idRefMap: Record<string, string> = {}
  const globalStyles = new Set<string>()

  return {
    name: 'ssr-styles',
    generateBundle (outputOptions) {
      const emitted: Record<string, string> = {}
      for (const file in cssMap) {
        if (!cssMap[file].length) { continue }

        const base = typeof outputOptions.assetFileNames === 'string'
          ? outputOptions.assetFileNames
          : outputOptions.assetFileNames({
            type: 'asset',
            name: `${filename(file)}-styles.mjs`,
            source: ''
          })

        emitted[file] = this.emitFile({
          type: 'asset',
          name: `${filename(file)}-styles.mjs`,
          source: [
            ...cssMap[file].map((css, i) => `import s${i} from './${relative(dirname(base), this.getFileName(css))}';`),
            `export default [${cssMap[file].map((_, i) => `s${i}`).join(', ')}]`
          ].join('\n')
        })
      }

      const globalStylesArray = Array.from(globalStyles).map(css => idRefMap[css] && this.getFileName(idRefMap[css])).filter(Boolean)

      this.emitFile({
        type: 'asset',
        fileName: 'styles.mjs',
        source:
          [
            ...globalStylesArray.map((css, i) => `import s${i} from './${css}';`),
            `const globalStyles = [${globalStylesArray.map((_, i) => `s${i}`).join(', ')}]`,
            'const resolveStyles = r => globalStyles.concat(r.default || r || [])',
            `export default ${genObjectFromRawEntries(
              Object.entries(emitted).map(([key, value]) => [key, `() => import('./${this.getFileName(value)}').then(resolveStyles)`])
            )}`
          ].join('\n')
      })
    },
    renderChunk (_code, chunk) {
      if (!chunk.isEntry) { return null }

      for (const mod in chunk.modules) {
        if (isCSS(mod) && !mod.includes('&used')) {
          globalStyles.add(relative(options.srcDir, mod))
        }
      }

      return null
    },
    async transform (code, id) {
      const { pathname, search } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      const query = parseQuery(search)
      if (!pathname.match(/\.(vue|((c|m)?j|t)sx?)$/g) || query.macro) { return }
      if (options.shouldInline && !options.shouldInline(id)) { return }

      const _id = relative(options.srcDir, id)

      cssMap[_id] ||= []

      const styleImports = findStaticImports(code)
      if (!styleImports.length) { return }

      for (const [index, { specifier }] of styleImports.entries()) {
        const { type } = parseQuery(specifier)
        if (type !== 'style' && !specifier.endsWith('.css')) { continue }

        const resolution = await this.resolve(specifier, id)

        if (resolution) {
          const ref = this.emitFile({
            type: 'chunk',
            name: `${filename(id)}-styles-${index}.mjs`,
            id: resolution.id + '?inline&used'
          })

          idRefMap[relative(options.srcDir, resolution.id)] = ref
          cssMap[_id].push(ref)
        }
      }
    }
  }
}
