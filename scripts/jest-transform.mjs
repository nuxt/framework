import { transformSync } from 'esbuild'

// https://jestjs.io/docs/next/code-transformation
export default {
  process (src, path, _opts) {
    const r = transformSync(src, {
      target: 'node14',
      format: 'cjs',
      sourcefile: path,
      loader: path.endsWith('.ts') ? 'ts' : 'default'
    })
    r.code = r.code.replace(/import ['"]([^'"]*)['"]/g, (_, id) => `require('${id}')`)
    return r
  }
}
