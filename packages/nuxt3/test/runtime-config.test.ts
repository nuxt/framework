import { generateTypes, resolveSchema } from 'untyped'
import { expect, describe, it } from 'vitest'
import { deleteSchemaDefaults, normalizeUntypedOutput, withLastLevelDescription } from '../src/core/template-utils'

const serverSideNotice = 'This value is only accessible from server-side.'

const getLinesArr = (output: string, debugIndexes = false) => {
  return output.split('\n').map((line, i) => debugIndexes ? [i, line.trim()] : line.trim())
}

const genExampleConfig = () => ({
  apiHost: 'https://api.example.com',
  apiPort: 1337,
  acme: {
    project: {
      id: 'Nuxt'
    }
  },

  // test all sorts of values
  stringVal: 'Nuxt',
  numberVal: 42,
  bigIntVal: BigInt(16),
  falseVal: false,
  trueVal: true,
  symbolVal: Symbol('Nuxt'),
  arrowFunctionVal: (arg1: string, arg2: number) => ({ valid: Boolean(arg1 && arg2) }),
  functionVal (arg1: string, arg2: number) {
    return { valid: Boolean(arg1 && arg2) }
  },
  objectVal: {
    value: 'Nuxt'
  },
  nestedObjectVal: {
    nested: {
      value: 'Nuxt'
    }
  },
  deepNestedObjectVal: {
    deep: {
      nested: {
        value: 'Nuxt'
      }
    }
  },
  undefinedVal: undefined,
  nullVal: null,
  arrayVal: ['Nuxt'],
  variedTypesArrayVal: ['Nuxt', 42, false],
  nestedArrayVal: [['Nuxt'], [42], [false]],
  deepNestedArrayVal: [[0, ['Nuxt'], [42], [false]], [1, ['Nuxt'], [42], [false]]]
})

describe('runtime-config:typings', () => {
  it('should not contain `@default` JSDoc tags', () => {
    const schema = resolveSchema(genExampleConfig())

    // Simulate multi-lines JSDoc
    schema.properties.apiHost.title = 'Title placeholder'
    schema.properties.apiHost.description = 'Description placeholder'

    const output = normalizeUntypedOutput(generateTypes(deleteSchemaDefaults(schema)))

    expect(output).to.not.contain('@default')
  })

  it('should be able to warn about server-side scope', () => {
    const schema = resolveSchema(genExampleConfig())
    const output = normalizeUntypedOutput(generateTypes(withLastLevelDescription(deleteSchemaDefaults(schema), serverSideNotice)))
    const outputLines = getLinesArr(output)

    expect(outputLines[1]).to.equal(`/** ${serverSideNotice} */`)
    expect(outputLines[4]).to.equal(`/** ${serverSideNotice} */`)
    expect(outputLines[9]).to.equal(`/** ${serverSideNotice} */`)
  })

  it('should not throw with undefined configs', () => {
    const getOutput = () =>
      normalizeUntypedOutput(
        generateTypes(
          deleteSchemaDefaults(
            withLastLevelDescription(
              resolveSchema(undefined),
              serverSideNotice
            )
          )
        )
      )

    expect(getOutput).to.not.throw()
  })

  it('should generate objects trees', () => {
    const schema = resolveSchema(genExampleConfig())
    const output = normalizeUntypedOutput(generateTypes(deleteSchemaDefaults(schema)))
    const outputLines = getLinesArr(output) as string[]

    expect(outputLines[5].startsWith('acme')).to.toBeTruthy()
    expect(outputLines[6].startsWith('project')).to.toBeTruthy()
    expect(outputLines[7].startsWith('id')).to.toBeTruthy()
  })
})
