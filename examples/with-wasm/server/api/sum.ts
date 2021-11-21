import { useQuery, lazyHandle } from 'h3'

export default lazyHandle(async () => {
  // @ts-ignore
  const { exports: { sum } } = await initWasmModule(import('~/server/wasm/sum.wasm'))

  return (req) => {
    const { a = 0, b = 0 } = useQuery(req)
    return { sum: sum(a, b) }
  }
})

async function initWasmModule (wasmModule, ctx = {}) {
  const init = await Promise.resolve(wasmModule).then(m => m.default || m)
  const { instance } = await init(ctx)
  return instance
}
