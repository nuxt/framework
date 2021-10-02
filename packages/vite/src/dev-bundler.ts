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
  if (id && id.startsWith('/@id/')) {
    id = id.slice('/@id/'.length)
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
const __vite_ssr_import_meta__ = { hot: { accept() {} } };
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

export async function bundleRequest (viteServer: vite.ViteDevServer, entryId) {
  const chunks = await transformRequestRecursive(viteServer, entryId)

  const listIds = ids => ids.map(id => `// - ${id} (${hashId(id)})`).join('\n')
  const chunksCode = chunks.map(chunk => `
// --------------------
// Request: ${chunk.id}
// Parents: \n${listIds(chunk.parents)}
// Dependencies: \n${listIds(chunk.deps)}
// --------------------
const ${hashId(chunk.id)} = ${chunk.code}
`).join('\n')

  const manifestCode = 'const __chunks__ = {\n' +
   chunks.map(chunk => ` '${chunk.id}': ${hashId(chunk.id)}`).join(',\n') + '\n}'

  const dynamicImportCode = `
const __import_cache__ = {}

const __importing__ = new Set() // TODO: Debug
setTimeout(() => console.log(new Date(), __importing__), 1500)

function __import__ (id) {
  if (__import_cache__[id]) {
    return __import_cache__[id]
  }
  __importing__.add(id)
  __import_cache__[id] = Promise.resolve(__chunks__[id]()).then(mod => {
    __importing__.delete(id)
    return mod
  })
  return __import_cache__[id]
}

function __vite_ssr_import__ (id) {
  __import__(id)
}

function __vite_ssr_dynamic_import__(id) {
  __import__(id)
}
`

  const helpers = `
globalThis.__createViteSSRExportAll__ = function (ssrModule) {
  return (sourceModule) => {
    for (const key in sourceModule) {
      if (key !== 'default') {
        Object.defineProperty(ssrModule, key, {
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

  const code = [
    chunksCode,
    manifestCode,
    dynamicImportCode,
    helpers,
    `export default await __import__('${entryId}')`
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
