import { builtinModules } from 'module'
import { createHash } from 'crypto'
import { promises as fsp } from 'fs'
import { resolve } from 'path'
import * as vite from 'vite'

interface TransformChunk {
  request: string,
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
const __vite_ssr_exportAll__ = __createViteSSRExportAll__(__vite_ssr_exports__);
const __vite_ssr_import_meta__ = { hot: { accept() {} } };
${res.code || '/* empty */'};
return __vite_ssr_exports__;
}`
  return { code, deps: res.deps || [], dynamicDeps: res.dynamicDeps || [] }
}

async function transformRequestRecursive (viteServer: vite.ViteDevServer, request, parent = '<entry>', chunks: Record<string, TransformChunk> = {}) {
  if (chunks[request]) {
    chunks[request].parents.push(parent)
    return
  }
  const res = await transformRequest(viteServer, request)
  const deps = uniq([...res.deps, ...res.dynamicDeps])

  chunks[request] = {
    request,
    code: res.code,
    deps,
    parents: [parent]
  } as TransformChunk
  for (const dep of deps) {
    await transformRequestRecursive(viteServer, dep, request, chunks)
  }
  return Object.values(chunks)
}

const COMMON_UTILS = `
const __import_cache__ = {}
function __import__ (request) {
  const id = __manifest__[request]
  if (__import_cache__[id]) {
    return __import_cache__[id]
  }
  return __import_cache__[id] = import('./chunks/' + id + '.mjs').then(r => r.default())
}

globalThis.__vite_ssr_import__ = __import__
globalThis.__vite_ssr_dynamic_import__ = __import__



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
}`

export async function bundleRequest (viteServer: vite.ViteDevServer, id) {
  const transformedChunks = await transformRequestRecursive(viteServer, id)

  const listIds = ids => ids.map(id => `// - ${id} (${hashId(id)})`).join('\n')

  const chunks = transformedChunks.map((chunk) => {
    const id = hashId(chunk.request)
    return {
      request: chunk.request,
      id,
      code: `
// --------------------
// Request: ${chunk.request}
// Parents: \n${listIds(chunk.parents)}
// Dependencies: \n${listIds(chunk.deps)}
// --------------------
export default ${chunk.code}
`
    }
  })

  const entry = `
const __manifest__ = {\n${chunks.map(chunk => ` '${chunk.request}': '${chunk.id}'`).join(',\n')}\n}

${COMMON_UTILS}

const entry = await __import__('${id}')
export default entry
`

  return { chunks, entry }
}

export async function writeBundle (bundle, outDir, entryName = 'index') {
  await fsp.mkdir(resolve(outDir)).catch(() => {})
  await fsp.mkdir(resolve(outDir, 'chunks')).catch(() => {})
  await Promise.all(bundle.chunks.map(async (chunk) => {
    await fsp.writeFile(resolve(outDir, 'chunks', chunk.id + '.mjs'), chunk.code, 'utf-8')
  }))
  await fsp.writeFile(resolve(outDir, entryName + '.mjs'), bundle.entry, 'utf-8')
}

function hashId (id: string) {
  return 'chunk_' + hash(id)
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
