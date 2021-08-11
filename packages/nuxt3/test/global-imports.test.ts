import { expect } from 'chai'
import { TrsnsformPlugin } from '../src/global-imports/transform'

describe('module:global-imports:build', () => {
  const { transform } = TrsnsformPlugin.raw({ ref: 'vue' })

  it('should correct inject', () => {
    expect(transform('const a = ref(0)', ''))
      .to.equal('import { ref } from \'vue\';const a = ref(0)')
  })

  it('should ignore imported', () => {
    expect(transform('import { ref } from "foo";const a = ref(0)', ''))
      .to.equal('import { ref } from "foo";const a = ref(0)')
  })
})
