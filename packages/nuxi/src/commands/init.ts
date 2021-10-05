import { existsSync, readdirSync } from 'fs'
import createDegit from 'degit'
import { relative, resolve } from 'pathe'
import { warn, info, error } from '../utils/log'
import { defineNuxtCommand } from './index'

const rpath = p => relative(process.cwd(), p)

const knownTemplates = {
  nuxt3: 'nuxt/starter#v3',
  v3: 'nuxt/starter#v3',
  bridge: 'nuxt/starter#bridge'
}

export default defineNuxtCommand({
  meta: {
    name: 'init',
    usage: 'npx nuxi init [dir name] [--no-cache] [--verbose|-v] [--template,-t]',
    description: 'Initialize a fresh project'
  },
  async invoke (args) {
    // Clone template
    const t = args.template || args.t
    const src = knownTemplates[t] || t || 'nuxt/starter#v3'
    const dstDir = resolve(process.cwd(), args._[0] || 'nuxt-app')
    const degit = createDegit(src, { cache: false /* TODO: buggy */, verbose: (args.verbose || args.v) })
    if (existsSync(dstDir) && readdirSync(dstDir).length) {
      error(`Directory ${dstDir} is not empty. Please use another name or remove it first. Aborting.`)
      process.exit(1)
    }
    const formatArgs = msg => msg.replace('options.', '--')
    degit.on('warn', event => warn(formatArgs(event.message)))
    degit.on('info', event => info(formatArgs(event.message)))
    await degit.clone(dstDir)

    // Show neet steps
    console.log('\n 🎉  Congratulations! Another Nuxt project just starteed! Next steps:' + [
      '',
      `📁  \`cd ${rpath(dstDir)}\``,
      '💿  Install dependencies with `npm install` or `yarn install`',
      '🚀  Start development server with `yarn dev`',
      ''
    ].join('\n\n    '))
  }
})
