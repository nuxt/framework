import { generateTypes, resolveSchema } from 'untyped'
import { expect, describe, it } from 'vitest'
import { deleteSchemaDefaults, normalizeUntypedOutput, withDescription } from '../src/core/template-utils'

const serverSideNotice = 'This value is only accessible from server-side.'

describe('runtime-config:typings', () => {
  it('should not contain `@default` tags', () => {
    const schema = resolveSchema({
      apiHost: 'Alice',
      apiPort: 1337
    })

    // Simulate multi-lines JSDOc
    schema.properties.apiHost.title = 'Title placeholder'
    schema.properties.apiHost.description = 'Description placeholder'

    const output = normalizeUntypedOutput(generateTypes(deleteSchemaDefaults(schema)))

    expect(output).to.not.contain('@default')
  })

  it('should be able to warn about server-side scope', () => {
    const schema = resolveSchema({
      apiHost: 'Alice',
      apiPort: 1337
    })

    const output = normalizeUntypedOutput(generateTypes(withDescription(deleteSchemaDefaults(schema), serverSideNotice)))

    const outputLines = output.split('\n').map(line => line.trim())

    expect(outputLines[1]).to.equal(`/** ${serverSideNotice} */`)
    expect(outputLines[4]).to.equal(`/** ${serverSideNotice} */`)
  })

  it('should not throw errors with undefined configs', () => {
    const config = undefined

    const getOutput = () => normalizeUntypedOutput(
      generateTypes(
        deleteSchemaDefaults(
          withDescription(
            resolveSchema(config),
            serverSideNotice
          )
        )
      )
    )

    expect(getOutput).not.toThrow()
  })
})
