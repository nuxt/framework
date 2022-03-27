import { existsSync, promises as fsp } from 'fs'
import { resolve, dirname } from 'pathe'
import consola from 'consola'
import { loadKit } from '../utils/kit'
import { templates } from '../utils/templates'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'add',
    usage: `npx nuxi add [--cwd] [--force] ${Object.keys(templates).join('|')} <name>`,
    description: 'Create a new template file.'
  },
  async invoke (args) {
    const cwd = resolve(args.cwd || '.')

    const template = args._[0]
    let name = args._[1]
    let mode = (args.client && 'client') || (args.server && 'server')

    // Validate template name
    if (!templates[template]) {
      consola.error(`Template ${template} is not supported. Possible values: ${Object.keys(templates).join(', ')}`)
      process.exit(1)
    }

    // Validate options
    if (!name) {
      consola.error('name argument is missing!')
      process.exit(1)
    }

    // Load config in order to respect srcDir
    const kit = await loadKit(cwd)
    const config = await kit.loadNuxtConfig({ cwd })

    const extRegex = /\.[a-z]+$/
    const extProvided = name.match(extRegex)?.[0]
    const modeProvided = name.match(/\.(client|server)/)?.[0]

    if (extProvided && extProvided !== modeProvided) {
      name = name.replace(extRegex, '')
    }

    if (modeProvided) {
      name = name.replace(modeProvided, '')
      if (!mode) { mode = modeProvided.replace(/\./, '') }
    }

    // Resolve template
    const res = templates[template]({ name, mode })

    // Resolve full path to generated file
    const path = resolve(config.srcDir, res.path)

    // Ensure not overriding user code
    if (!args.force && existsSync(path)) {
      consola.error(`File exists: ${path} . Use --force to override or use a different name.`)
      process.exit(1)
    }

    // Ensure parent directory exists
    const parentDir = dirname(path)
    if (!existsSync(parentDir)) {
      consola.info('Creating directory', parentDir)
      if (template === 'page') {
        consola.info('This enables vue-router functionality!')
      }
      await fsp.mkdir(parentDir, { recursive: true })
    }

    // Write file
    await fsp.writeFile(path, res.contents.trim() + '\n')
    consola.info(`🪄 Generated a new ${template} in ${path}`)
  }
})
