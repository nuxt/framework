import { existsSync } from 'fs'
import { resolve, dirname, normalize } from 'pathe'
import fse from 'fs-extra'
import { nodeFileTrace, NodeFileTraceOptions } from '@vercel/nft'
import type { Plugin } from 'rollup'
import { resolvePath, isValidNodeImport } from 'mlly'

export interface NodeExternalsOptions {
  inline?: string[]
  external?: string[]
  outDir?: string
  trace?: boolean
  traceOptions?: NodeFileTraceOptions
  moduleDirectories?: string[]
  exportConditions?: string[]
}

export function externals (opts: NodeExternalsOptions): Plugin {
  const trackedExternals = new Set<string>()

  return {
    name: 'node-externals',
    async resolveId (id, importer, options) {
      // Skip internals
      if (!id || id.startsWith('\x00') || id.includes('?') || id.startsWith('#')) {
        return null
      }

      // Normalize path on windows
      const normalizedId = normalize(id)

      const _id = normalizedId.split('node_modules/').pop()
      if (!opts.external.find(i => _id.startsWith(i) || id.startsWith(i))) {
        // Resolve relative paths and exceptions
        // Ensure to take absolute and relative id
        if (_id.startsWith('.') || opts.inline.find(i => _id.startsWith(i) || normalizedId.startsWith(i))) {
          return null
        }
      }

      // Resolve external (rollup => node)
      const resolved = await this.resolve(id, importer, { ...options, skipSelf: true }) || { id }
      if (!existsSync(resolved.id)) {
        resolved.id = await resolvePath(resolved.id, {
          conditions: opts.exportConditions,
          url: opts.moduleDirectories
        })
      }

      // Ensure id is a valid import
      if (!await isValidNodeImport(resolved.id)) {
        return {
          ...resolved,
          external: false
        }
      }

      // Track externals
      trackedExternals.add(resolved.id)

      // Normalize id with explicit protocol
      // TODO: Fix production build
      // resolved.id = normalizeid(resolved.id)

      return {
        ...resolved,
        external: true
      }
    },
    async buildEnd () {
      if (opts.trace !== false) {
        const tracedFiles = await nodeFileTrace(Array.from(trackedExternals), opts.traceOptions)
          .then(r => Array.from(r.fileList).map(f => resolve(opts.traceOptions.base, f)))
          .then(r => r.filter(file => file.includes('node_modules')))

        // // Find all unique package names
        const pkgs = new Set<string>()
        for (const file of tracedFiles) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [_, baseDir, pkgName, _importPath] = /^(.+\/node_modules\/)([^@/]+|@[^/]+\/[^/]+)(\/?.*?)?$/.exec(file)
          pkgs.add(resolve(baseDir, pkgName, 'package.json'))
        }

        for (const pkg of pkgs) {
          if (!tracedFiles.includes(pkg)) {
            tracedFiles.push(pkg)
          }
        }

        const writeFile = async (file) => {
          // Skip symlinks that are included in fileList
          if (await fse.stat(file).then(i => i.isDirectory())) {
            return
          }
          const src = resolve(opts.traceOptions.base, file)
          const dst = resolve(opts.outDir, 'node_modules', file.split('node_modules/').pop())
          await fse.mkdirp(dirname(dst))
          await fse.copyFile(src, dst)
        }
        if (process.platform === 'win32') {
          // Workaround for EBUSY on windows (#424)
          for (const file of tracedFiles) {
            await writeFile(file)
          }
        } else {
          await Promise.all(tracedFiles.map(writeFile))
        }
      }
    }
  }
}
