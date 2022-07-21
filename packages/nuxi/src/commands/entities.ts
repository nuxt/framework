import consola from 'consola'
import { resolve } from 'pathe'
import { loadKit } from '../utils/kit'
import { entities, EntityKey, EntityCommands } from '../utils/entities'
import { defineNuxtCommand } from './index'

export default function (entity: EntityKey) {
  const { commands, description } = entities[entity]

  return defineNuxtCommand({
    meta: {
      name: entity,
      usage: `npx nuxi ${entity} ${(commands).join('|')} <name> [--cwd]`,
      description: description || `Manage ${entity}`
    },
    async invoke (args) {
      const cwd = resolve(args.cwd || '.')

      const [cmd, name] = args._

      if (!cmd) {
        consola.info('No action specified.')
        consola.info(`Usage: npx nuxi ${entity} ${(commands).map(s => `\`${s}\``).join('|')} <name> [--cwd]`)
        process.exit(1)
      }

      if (!commands.includes(cmd)) {
        consola.info('Unsupported action')
        consola.info(`Usage: npx nuxi ${entity} ${(commands).map(s => `\`${s}\``).join('|')} <name> [--cwd]`)
        process.exit(1)
      }

      if (!name && !['show'].includes(cmd)) {
        consola.info('`Name` argument is required.')
        consola.info(`Usage: npx nuxi ${entity} ${cmd} <name> [--cwd]`)
        process.exit(1)
      }

      const conf: Parameters<typeof EntityCommands>[0] = { entity }

      const { loadNuxtConfig } = await loadKit(cwd)
      conf.srcDir = (await loadNuxtConfig({ cwd }))!.srcDir

      const entityCommands = EntityCommands(conf)

      if (cmd === 'rename') {
        const newName = args._[2]

        if (!newName) {
          consola.info('Please provide a new name.')
          consola.info(`Usage: npx nuxi ${entity} ${cmd} <name> <new-name> [--cwd]`)
          process.exit(1)
        }

        await entityCommands.rename(name, newName)
      } else { await entityCommands[cmd](name) }
    }
  })
}
