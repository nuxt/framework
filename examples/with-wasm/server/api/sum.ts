import { useQuery, lazyHandle } from 'h3'

export default lazyHandle(async () => {
  // @ts-ignore
  const { exports: { sum } } = await loadWasmInstance(() => import('~/server/wasm/sum.wasm'))

  return (req) => {
    const { a = 0, b = 0 } = useQuery(req)
    return { sum: sum(a, b) }
  }
})

async function loadWasmInstance (importFn, imports = {}) {
  const init = await importFn().then(m => m.default || m)
  const { instance } = await init(imports)
  return instance
}
