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
  const code = `async function (global, __vite_ssr_exports__, __vite_ssr_import_meta__, __vite_ssr_import__, __vite_ssr_dynamic_import__, __vite_ssr_exportAll__) {
${res.code || '/* empty */'};
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

export async function bundleRequest (viteServer: vite.ViteDevServer, entryURL) {
  const chunks = await transformRequestRecursive(viteServer, entryURL)

  const listIds = ids => ids.map(id => `// - ${id} (${hashId(id)})`).join('\n')
  const chunksCode = chunks.map(chunk => `
// --------------------
// Request: ${chunk.id}
// Parents: \n${listIds(chunk.parents)}
// Dependencies: \n${listIds(chunk.deps)}
// --------------------
const ${hashId(chunk.id)} = ${chunk.code}
`).join('\n')

  const manifestCode = 'const __modules__ = {\n' +
   chunks.map(chunk => ` '${chunk.id}': ${hashId(chunk.id)}`).join(',\n') + '\n}'

  // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/ssr/ssrModuleLoader.ts
  const ssrModuleLoader = `
const __pendingModules__ = new Map()
const __pendingImports__ = new Map()

function __ssrLoadModule__(id, urlStack = []) {
  const pendingModule = __pendingModules__.get(id)
  if (pendingModule) { return pendingModule }
  const promise = __instantiateModule__(id, urlStack)
  __pendingModules__.set(id, promise)
  promise.catch(() => { __pendingModules__.delete(id) })
         .finally(() => { __pendingModules__.delete(id) })
  return promise
}

async function __instantiateModule__(url, urlStack) {
  const mod = __modules__[url]
  if (mod.stubModule) { return mod.stubModule }
  const stubModule = { [Symbol.toStringTag]: 'Module' }
  Object.defineProperty(stubModule, '__esModule', { value: true })
  mod.stubModule = stubModule
  const importMeta = { url, hot: { accept() {} } }
  urlStack = urlStack.concat(url)
  const isCircular = url => urlStack.includes(url)
  const pendingDeps = []
  const ssrImport = async (dep) => {
    if (!isCircular(dep) && !__pendingImports__.get(dep)?.some(isCircular)) {
      pendingDeps.push(dep)
      if (pendingDeps.length === 1) {
        __pendingImports__.set(url, pendingDeps)
      }
      await __ssrLoadModule__(url, urlStack)
      if (pendingDeps.length === 1) {
        __pendingImports__.delete(url)
      } else {
        pendingDeps.splice(pendingDeps.indexOf(dep), 1)
      }
    }
    return __modules__[dep].stubModule
  }
  const ssrDynamicImport = ssrImport

  function ssrExportAll(sourceModule) {
    for (const key in sourceModule) {
      if (key !== 'default') {
        Object.defineProperty(ssrModule, key, {
          enumerable: true,
          configurable: true,
          get() { return sourceModule[key] }
        })
      }
    }
  }

  await mod(
    globalThis,
    stubModule,
    importMeta,
    ssrImport,
    ssrDynamicImport,
    ssrExportAll
  )

  return stubModule
}
`

  const code = [
    chunksCode,
    manifestCode,
    ssrModuleLoader,
    `export default await __ssrLoadModule__('${entryURL}')`
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
