import { existsSync, promises as fsp, readdirSync } from 'fs'
import { resolve } from 'pathe'
import { loadKit } from '../utils/kit'
import { templates } from '../utils/templates'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'add',
    usage: `npx nuxi add ${Object.keys(templates).join('|')} <name> [rootDir]`,
    description: 'Create new components, plugins, composables by using handy CLI commands'
  },
  async invoke (args) {
    const rootDir = resolve(args.rootDir || '.')
    const element = args._[0]
    const name = args._[1]

    const { loadNuxt } = await loadKit(rootDir)
    const nuxt = await loadNuxt({ rootDir, config: { _export: true } })

    const rootDirPath = nuxt.options.rootDir

    const schema = templates[element](name)

    if (!schema) { throw new Error('Template was not found. Pleasy try one of the templates described in the docs') }

    const { path, template } = schema

    const pathWithRootDir = rootDirPath + path

    await writeTemplate(pathWithRootDir, template)
  }
})

async function writeTemplate (path: string, template: string) {
  const pathElements = path.split('/')
  const pathWithoutFile = pathElements.filter((element, index) => index < pathElements.length - 1).join('/')

  if (!(existsSync(pathWithoutFile) && readdirSync(pathWithoutFile).length)) {
    await fsp.mkdir(pathWithoutFile, { recursive: true })
  }

  await fsp.writeFile(path, template)
}
