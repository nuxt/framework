import { defineNuxtModule } from '@nuxt/kit'
import { Schema } from 'untyped'
import { mkdirp, readJSON, writeFile } from 'fs-extra'
import { join, resolve } from 'upath'
import { format } from 'prettier'
import rimraf from 'rimraf'

// Map of markdown syntaxes -> prettier parsers
const formatters = {
  html: 'html',
  js: 'babel',
  json: 'json',
  ts: 'babel',
  vue: 'vue'
}

function generateMarkdown (schema: Schema, title: string, level: string) {
  const lines: string[] = []

  if (title.startsWith('_') || schema.tags?.includes('@private')) {
    return lines
  }

  lines.push(`${level} ${title}`)

  if (schema.type !== 'object' || !schema.properties) {
    // Type and default
    lines.push(`- **Type**: \`${schema.type}\``)
    if ('default' in schema) {
      // TODO: https://github.com/unjs/untyped/issues/8
      lines.push(
        `- **Default**: \`${JSON.stringify(schema.default).replace(
          new RegExp(join(require.resolve('@nuxt/kit'), '../..') + '/', 'g'),
          ''
        )}\``
      )
    }
    lines.push('')

    // Signature (function)
    // TODO: https://github.com/unjs/untyped/issues/6
    // if (schema.type === 'function') {
    //   lines.push('```ts', genFunctionType(schema), '```', '')
    // }
  }

  // Title
  if (schema.title) {
    lines.push('> ' + schema.title, '')
  }

  // Description
  if (schema.description) {
    lines.push('', schema.description, '')
  }

  // Add tags, like examples, warnings, links, etc.
  if (schema.tags) {
    const chunk = []
    for (const line of schema.tags) {
      switch (true) {
        // Closing tag of a code example
        case line.startsWith('```') && !!chunk.length: {
          // Format example and push to lines
          const language = chunk[0].slice(3)
          let code = chunk.slice(1).join('\n')
          if (language in formatters) {
            try {
              code = format(code, {
                parser: formatters[language],
                semi: false,
                singleQuote: true
              }).replace(/\n$/g, '')
            } catch (e) {
              e.message = `Could not format a code example from ${title}.`
              e.stack = code + e.stack
              console.error(e)
              throw e
            }
          }
          lines.push('', chunk[0], ...code.split('\n'), '```', '')
          chunk.length = 0
          break
        }

        // An opening or subsequent line of a code example
        case line.startsWith('```') || !!chunk.length:
          chunk.push(line)
          break

        case line.startsWith('@example'):
          lines.push(line.replace('@example', `${level}# Example`))
          break

        case line.startsWith('@note'):
          lines.push('::alert{type="info"}', line.replace('@note', '**Note**. '), '::')
          break

        case line.startsWith('@warning'):
          lines.push('::alert{type="warning"}', line.replace('@warning', '**Warning**. '), '::')
          break

        case line.startsWith('@deprecated'):
          lines.push('::alert{type="danger"}', line.replace('@deprecated', '**Deprecated**. '), '::')
          break

        // Fall back to bold line
        default:
          lines.push(line.replace(/^@.*$/, r => `**${r[1].toUpperCase() + r.slice(2)}**`))
      }
    }
  }

  // Generate Markdown for any properties of this object
  if (schema.type === 'object') {
    const keys = Object.keys(schema.properties || {}).sort()
    for (const key of keys) {
      const val = schema.properties[key] as Schema
      lines.push('', ...generateMarkdown(val, `\`${key}\``, level + '#'))
    }
  }

  return lines
}

export default defineNuxtModule({
  name: 'schema-to-markdown',
  setup (_options, nuxt) {
    nuxt.hook('ready', async () => {
      const apiDocsPath = resolve(nuxt.options.rootDir, 'content/9.api')

      // Prepare content directory
      rimraf.sync(apiDocsPath)
      await mkdirp(apiDocsPath)

      const apiSchema: Schema = await readJSON(require.resolve('@nuxt/kit/schema/config.schema.json'))
      const keys = Object.keys(apiSchema.properties).sort()

      // Generate a separate file for each top-level configuration property
      for (const [index, key] of keys.entries()) {
        const schema = apiSchema.properties[key]

        // ...with the exception of top-level deprecated or private properties
        if (
          key.startsWith('_') ||
          schema.tags?.includes('@private') ||
          'deprecated' in schema ||
          schema.tags?.some(tag => tag.startsWith('@deprecated'))
        ) {
          continue
        }

        const lines = generateMarkdown(schema, key, '#')

        // Add Docus frontmatter
        const attributes = Object.entries({
          title: ` ${key}`,
          description: schema.title
        }).map(([key, val]) => `${key}: "${val}"`)

        lines.unshift('---', ...attributes, '---')

        await writeFile(join(apiDocsPath, `${index}.${key}.md`), lines.join('\n'))
      }

      const frontmatter = [
        '---',
        'navigation:',
        '  title: API (config)',
        '  collapse: true',
        '---'
      ]

      await writeFile(join(apiDocsPath, 'index.md'), frontmatter.join('\n'))
    })
  }
})
