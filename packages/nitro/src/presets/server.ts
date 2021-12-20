import consola from 'consola'
import { extendPreset, hl, prettyPath } from '../utils'
import { NitroPreset, NitroContext } from '../context'
import { node } from './node'

export const server: NitroPreset = extendPreset(node, {
  entry: '{{ _internal.runtimeDir }}/entries/server',
  serveStatic: true,
  previewCommand: 'node {{ output.serverDir }}/index.mjs',
  hooks: {
    'nitro:compiled' ({ output }: NitroContext) {
      consola.success('Ready to run', hl('node ' + prettyPath(output.serverDir) + '/index.mjs'))
    }
  }
})
