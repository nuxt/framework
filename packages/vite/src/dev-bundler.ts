import { builtinModules } from 'module'
import { createHash } from 'crypto'
import * as vite from 'vite'

interface TransformChunk {
  id: string,
  code: string,
  deps: string[],
  parents: string[]
}

interface SSRTransformResult {
  code: string,
  map: object,
  deps: string[]
  dynamicDeps: string[]
}

async function transformRequest (viteServer: vite.ViteDevServer, id) {
  // Virtual modules start with `\0`
  if (id && id.startsWith('/@id/__x00__')) {
    id = '\0' + id.slice('/@id/__x00__'.length)
  }

  // Externals
  if (builtinModules.includes(id)) {
    return {
      code: `() => import('${id}')`,
      deps: [],
      dynamicDeps: []
    }
  }

  // Transform
  const res: SSRTransformResult = await viteServer.transformRequest(id, { ssr: true }).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn(`[SSR] Error transforming ${id}: ${err}`)
    // console.error(err)
  }) as SSRTransformResult || { code: '', map: {}, deps: [], dynamicDeps: [] }

  // Wrap into a vite module
  const code = `async function () {
const __vite_ssr_exports__ = {};
const __vite_ssr_exportAll__ = __createViteSSRExportAll__(__vite_ssr_exports__)
${res.code || '/* empty */'};
return __vite_ssr_exports__;
}`
  return { code, deps: res.deps || [], dynamicDeps: res.dynamicDeps || [] }
}

async function transformRequestRecursive (viteServer: vite.ViteDevServer, id, parent = '<entry>', chunks: Record<string, TransformChunk> = {}) {
  if (chunks[id]) {
    chunks[id].parents.push(parent)
    return
  }
  const res = await transformRequest(viteServer, id)
  const deps = uniq([...res.deps, ...res.dynamicDeps])

  chunks[id] = {
    id,
    code: res.code,
    deps,
    parents: [parent]
  } as TransformChunk
  for (const dep of deps) {
    await transformRequestRecursive(viteServer, dep, id, chunks)
  }
  return Object.values(chunks)
}

export async function bundleRequest (viteServer: vite.ViteDevServer, id) {
  const chunks = await transformRequestRecursive(viteServer, id)

  const listIds = ids => ids.map(id => `// - ${id} (${hashId(id)})`).join('\n')
  const chunksCode = chunks.map(chunk => `
// --------------------
// Request: ${chunk.id}
// Parents: \n${listIds(chunk.parents)}
// Dependencies: \n${listIds(chunk.deps)}
// --------------------
const ${hashId(chunk.id)} = ${chunk.code}
`).join('\n')

  const manifestCode = 'const $chunks = {\n' +
   chunks.map(chunk => ` '${chunk.id}': ${hashId(chunk.id)}`).join(',\n') + '\n}'

  const dynamicImportCode = `
function __vite_ssr_import__ (id) {
  return Promise.resolve($chunks[id]()).then(mod => {
    // if (mod && !('default' in mod))
    //   mod.default = mod
    return mod
  })
}
function __vite_ssr_dynamic_import__(id) {
  return __vite_ssr_import__(id)
}
`

  // https://github.com/vitejs/vite/blob/fb406ce4c0fe6da3333c9d1c00477b2880d46352/packages/vite/src/node/ssr/ssrModuleLoader.ts#L121-L133
  const helpers = `
function __createViteSSRExportAll__(ssrModule) {
  return (sourceModule) => {
    for (const key in sourceModule) {
      if (key !== 'default') {
        Object.defineProperty(sourceModule, key, {
          enumerable: true,
          configurable: true,
          get() {
            return sourceModule[key]
          }
        })
      }
    }
  }
}
`

  // TODO: implement real HMR
  const metaPolyfill = `
const __vite_ssr_import_meta__ = {
  hot: {
    accept() {}
  }
}
`

  const code = [
    metaPolyfill,
    chunksCode,
    manifestCode,
    dynamicImportCode,
    helpers,
    `export default ${hashId(id)}`
  ].join('\n\n')

  return { code }
}

function hashId (id: string) {
  return '$id_' + hash(id)
}

function hash (input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .substr(0, length)
}

export function uniq<T> (arr: T[]): T[] {
  return Array.from(new Set(arr))
}
