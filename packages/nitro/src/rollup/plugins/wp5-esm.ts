import { promises as fsp, existsSync } from 'fs'
import { resolve } from 'upath'
import type { Plugin } from 'rollup'

const PLUGIN_NAME = 'wp5-esm'

interface Options {
  serverDir: string
  outDir: string
}

export function wp5Esm ({ serverDir, outDir }: Options): Plugin {
  return {
    name: PLUGIN_NAME,
    writeBundle: async () => {
      // Ensure we're running with a webpack project
      const wpManifest = resolve(serverDir, './server.manifest.json')
      if (!existsSync(wpManifest)) { return }

      // Ensure dynamic chunks are present in the correct directory for loading
      const { files = {} } = await import(wpManifest)
      for (const file in files) {
        const src = resolve(serverDir, file)
        const dest = resolve(outDir, file)
        if (!existsSync(dest)) {
          await fsp.copyFile(src, dest)
        }
      }
    }
  }
}
