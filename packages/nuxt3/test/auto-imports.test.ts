import { expect } from 'chai'
import { extractNamedExports } from '../src/auto-imports/composables'
import { TransformPlugin } from '../src/auto-imports/transform'

describe('module:auto-imports:build', () => {
  const { transform: _transform } = TransformPlugin.raw({
    ref: { from: 'vue' },
    computed: { from: 'bar' }
  }, {} as any)

  const transform = (code: string) => _transform.call({} as any, code, '')

  it('should correct inject', async () => {
    expect(await transform('const a = ref(0)')).to.equal('import { ref } from \'vue\';const a = ref(0)')
    expect(await transform('import { computed as ref } from "foo"; const a = ref(0)')).to.includes('import { computed } from \'bar\';')
  })

  it('should ignore existing imported', async () => {
    expect(await transform('import { ref } from "foo"; const a = ref(0)')).to.equal(null)
    expect(await transform('import ref from "foo"; const a = ref(0)')).to.equal(null)
    expect(await transform('import { z as ref } from "foo"; const a = ref(0)')).to.equal(null)
    expect(await transform('let ref = () => {}; const a = ref(0)')).to.equal(null)
    expect(await transform('let { ref } = Vue; const a = ref(0)')).to.equal(null)
    expect(await transform('let [\ncomputed,\nref\n] = Vue; const a = ref(0); const b = ref(0)')).to.equal(null)
  })

  it('should ignore comments', async () => {
    const result = await transform('// import { computed } from "foo"\n;const a = computed(0)')
    expect(result).to.equal('import { computed } from \'bar\';// import { computed } from "foo"\n;const a = computed(0)')
  })
})

describe('module:auto-imports:composable-extract', () => {
  const fixture = `
export function useA () {
  return 'a'
}
function useB () {
  return 'b'
}
function _useC () {
  return 'c'
}
export const useD = () => {
  return 'd'
}
export { useB, _useC as useC }
`
  it('should extract name exports', () => {
    expect(Array.from(extractNamedExports(fixture)).sort()).to.eql(['useA', 'useB', 'useC', 'useD'])
  })
})
