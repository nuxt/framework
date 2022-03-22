import { defineNuxtCommand } from "./index";
import { existsSync, promises as fsp, readdirSync } from 'fs'
import { resolve } from 'pathe'
import { loadKit } from '../utils/kit'

export default defineNuxtCommand({
  meta: {
    name: 'add',
    usage: 'npx nuxi add endpoint test',
    description: ''
  },
  async invoke(args) {
    const rootDir = resolve('.')
    const schematic = args._[0]
    const name = args._[1];

    const { loadNuxt } = await loadKit(rootDir)
    const nuxt = await loadNuxt({ rootDir, config: { _export: true } })

    const rootDirPath = nuxt.options.rootDir

    switch (schematic) {
      case 'endpoint':
        const endpointPath = `${rootDirPath}/server/api`
        const newEndpointPath = resolve(endpointPath, `${name.toLowerCase()}.ts`)

        if(!(existsSync(endpointPath) && readdirSync(endpointPath).length)) {
          await fsp.mkdir(endpointPath, { recursive: true })
        }
        await fsp.writeFile(newEndpointPath, `export default (req, res) => 'Hello ${name}'`)
        break
      case 'plugin':
        const pluginPath = `${rootDirPath}/plugins`
        const newPluginPath = resolve(pluginPath, `${name.toLowerCase()}.ts`)

        if(!(existsSync(pluginPath) && readdirSync(pluginPath).length)) {
          await fsp.mkdir(pluginPath, { recursive: true })
        }
        await fsp.writeFile(newPluginPath, 'export default defineNuxtPlugin(nuxtApp => {})')
        break
    }
  }
})
