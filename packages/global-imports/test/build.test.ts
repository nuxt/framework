import { expect } from 'chai'
import { BuildPlugin } from '../src/build'

describe('module:global-imports:build', () => {
  const transform = BuildPlugin.raw({
    ref: { name: 'ref', module: 'vue' }
  }).transform

  it('should correct inject', () => {
    expect(transform('const a = ref(0)', ''))
      .to.equal('import { ref } from \'vue\';const a = ref(0)')
  })

  it('should ignore imported', () => {
    expect(transform('import { ref } from "foo";const a = ref(0)', ''))
      .to.equal('import { ref } from "foo";const a = ref(0)')
  })
})
