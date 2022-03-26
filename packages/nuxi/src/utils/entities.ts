import fsp from 'fs/promises'
import { execSync } from 'child_process'
import consola from 'consola'
import mri from 'mri'
import { globby } from 'globby'
import { upperFirst } from 'scule'
import { resolve } from 'pathe'
import addCommand from '../commands/add'
import { findPackage, getNuxtConfig } from './fs'
import { getPackageManager } from './packageManagers'

const sharedCommands = ['add', 'new', 'show', 'rename', 'remove']

type Entity = ('api' | 'pages' | 'layouts' | 'components' | 'plugins' | 'modules' | 'composables' | 'middleware' | 'serverMiddleware')
type NuxiEntity = Record<Entity, { commands?: string[]; description?: string }>;

export const entities: NuxiEntity = {
  api: { commands: [] },
  pages: { commands: [] },
  layouts: { commands: [] },
  components: { commands: [] },
  plugins: { commands: [] },
  modules: { commands: [] },
  composables: { commands: [] },
  middleware: { commands: [] },
  serverMiddleware: { commands: [] }
}

export type EntityKey = keyof typeof entities & string
export const EntityKeys = Object.keys(entities) as EntityKey[]

for (const [k, v] of Object.entries(entities)) {
  if ((k as EntityKey) === 'modules') {
    const subset = sharedCommands.filter(s => ['add', 'new', 'show'].includes(s))
    v.commands = [...subset, ...v.commands]
    continue
  }

  v.commands = [...sharedCommands, ...v.commands]
}

const pattern = '**/*.{js,ts,vue,mjs}'

export function EntityCommands ({ entity, srcDir, rootDir } :{entity: string, srcDir?: string, rootDir: string}) {
  const singular = (entity.endsWith('s') ? entity.slice(0, -1) : entity)

  const entityDir = entity === 'api' ? 'server/api' : entity === 'serverMiddleware' ? 'server/middleware' : entity
  const path = resolve(srcDir, entityDir)

  const resolveFile = async (name: string) => {
    const modeProvided = ['.client', '.server'].some(mode => name.includes(mode))

    const extRegex = /\.[a-z]+$/
    let ext = (modeProvided ? name.slice(7) : name).match(extRegex)?.[0]
    const extProvided = !!ext

    const fileName = extProvided ? name : `${name}.${pattern.slice(5)}`

    const file = (await globby(fileName, { cwd: path, followSymbolicLinks: true })).map(p => resolve(path, p))?.[0]

    if (!file) {
      consola.warn(`No \`${singular}\` found matching the name \`${name}\`.`)
      process.exit(1)
    }

    if (!ext) { ext = file?.match(extRegex)?.[0] }

    return { file, ext, extProvided }
  }

  const add = async (name: string) => {
    if (!name) {
      consola.error(`\`Name\` argument is required to create a new \`${singular}\`.`)
      process.exit(1)
    }

    if (entity === 'modules') {
      const { dependencies = {}, devDependencies = {} } = findPackage(rootDir)

      if (dependencies[name] || devDependencies[name]) {
        consola.info(`\`${name}\` is already installed.`)
        process.exit(1)
      }

      const packageManager = getPackageManager(rootDir)
      if (!packageManager) {
        consola.info('Unable to detect package manager.')
        consola.info(`Run \`yarn add\`|\`npm install\` -D ${name}`)
      } else {
        execSync(`${packageManager} ${packageManager === 'yarn' ? 'add' : 'install'} -D ${name}`, { stdio: 'inherit' })
        consola.info(`\`${name}\` module installed.`)
        // TODO: Automatically update nuxt.config
        consola.info(`Add \`${name}\` to the modules array in nuxt.config.`)
      }

      process.exit(1)
    }

    await addCommand.invoke(mri([singular, name]))
    process.exit(1)
  }

  const show = async () => {
    if (entity === 'modules') {
      const { modules = [], buildModules = [] } = getNuxtConfig(rootDir)

      const entries = [...modules, ...buildModules]

      consola.info(`${entries.length} ${entries.length <= 1 ? singular : entity} found`)
      consola.info(entries.map(h => `\`${h}\``).join(' | '))
      process.exit(1)
    }

    let entries: string[] = await globby(pattern, { cwd: path, followSymbolicLinks: true })

    entries = entries.map(file => file.split(entity).pop())

    if (!entries.length) {
      consola.info(`No ${entity} have been added to this project.`)
      consola.info(`Use \`npx nuxi ${entity} new <name>\` to create a ${singular}.`)
      process.exit(1)
    }

    consola.info(`${entries.length} ${entries.length <= 1 ? singular : entity} found`)

    // TODO: Output pages mapped to routes, perhaps leveraging nuxt3 pages module mapping functionality
    // if (entity === 'pages') {}

    consola.info(entries.map(h => `\`${h}\``).join(' | '))

    process.exit(1)
  }

  const rename = async (name: string, newName: string) => {
    const { file, ext, extProvided } = await resolveFile(name)

    newName = newName.includes(ext) ? newName : `${newName}${ext}`
    const oldFileName = extProvided ? name : `${name}${ext}`
    const newFile = file.replace(oldFileName, newName)

    await fsp.rename(file, newFile)

    consola.info(`\`${upperFirst(singular)}\` entity: \`${name}\` renamed to \`${newName}\`.`)
    process.exit(1)
  }

  const remove = async (name: string) => {
    const { file } = await resolveFile(name)

    await fsp.rm(file)

    consola.info(`\`${upperFirst(singular)}\` entity: \`${name}\` was deleted.`)
    process.exit(1)
  }

  return { add, new: add, show, rename, remove }
}
