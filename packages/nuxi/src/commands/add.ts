import {existsSync, promises as fsp} from 'fs'
import {dirname, resolve} from 'pathe'
import consola from 'consola'
import {loadKit} from '../utils/kit'
import {templates} from '../utils/templates'
import {defineNuxtCommand} from './index'


export default defineNuxtCommand({
  meta: {
    name: 'add',
    usage: `npx nuxi add [--cwd] [--force] ${Object.keys(templates).join('|')} <name>`,
    description: 'Create a new template file.'
  },
  async invoke(args) {
    const cwd = resolve(args.cwd || '.')

    const template = args._[0]
    const name = args._[1]

    consola.info('custom templates')
    const files = await fsp.readdir(resolve('templates'))

    const customTemplateArray = (await Promise.all(files.map(async file => await (import(resolve('templates', file))))))
    const customTemplates = customTemplateArray.reduce((r, c) => Object.assign(r, c), {})
    consola.info(customTemplates)

    const allTemplates = {
      ...templates,
      ...customTemplates
    }

    // Validate template name
    if (!allTemplates[template]) {
      consola.error(`Template ${template} is not supported. Possible values: ${Object.keys(allTemplates).join(', ')}`)
      process.exit(1)
    }

    // Validate options
    if (!name) {
      consola.error('name argument is missing!')
      process.exit(1)
    }

    // Load config in order to respect srcDir
    const kit = await loadKit(cwd)
    const config = await kit.loadNuxtConfig({cwd})

    // Resolve template
    const res = allTemplates[template]({name})

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
      if (template === 'template' && name.lastIndexOf('/') !== -1) {
        consola.error('This template does not support nested directories')
        process.exit(1)
      }
      await fsp.mkdir(parentDir, {recursive: true})
    }

    // Write file
    await fsp.writeFile(path, res.contents.trim() + '\n')
    consola.info(`🪄 Generated a new ${template} in ${path}`)
  }
})
