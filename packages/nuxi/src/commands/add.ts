import { defineNuxtCommand } from "./index";
import { existsSync, promises as fsp, readdirSync } from 'fs'
import { resolve } from 'pathe'
import { loadKit } from '../utils/kit'

export default defineNuxtCommand({
  meta: {
    name: 'add',
    usage: 'npx nuxi add api|plugin|component|composable|middleware|layout|page <name> [rootDir]',
    description: 'Create new components, plugins, composables by using handy CLI commands'
  },
  async invoke(args) {
    const rootDir = resolve(args.rootDir || '.')
    const schematic = args._[0]
    const name = args._[1];

    const { loadNuxt } = await loadKit(rootDir)
    const nuxt = await loadNuxt({ rootDir, config: { _export: true } })

    const rootDirPath = nuxt.options.rootDir

    const templates = {
      api: {
        path: `${rootDirPath}/server/api`,
        template: `export default (req, res) => 'Hello ${name}'`,
        fileName: name,
        fileExtension: 'ts'
      },
      plugin: {
        path: `${rootDirPath}/plugins`,
        template: 'export default defineNuxtPlugin(nuxtApp => {})',
        fileName: name,
        fileExtension: 'ts'
      },
      component: {
        path: `${rootDirPath}/components`,
        template: `<template>
  <div>${name}</div>
</template>

<script setup></script>`,
        fileName: name,
        fileExtension: 'vue'
      },
      composable: {
        path: `${rootDirPath}/composables`,
        template: `export const ${name} = () => {
  return useState(${name}, () => 'bar')
}`,
        fileName: !name.includes('use') ? `use${name.charAt(0).toUpperCase() + name.slice(1)}` : name,
        fileExtension: 'ts'
      },
      middleware: {
        path: `${rootDirPath}/middleware`,
        template: 'export default defineNuxtRouteMiddleware((to, from) => {})',
        fileName: name,
        fileExtension: 'ts'
      },
      layout: {
        path: `${rootDirPath}/layouts`,
        template: `<template>
  <div>
    ${name}
    <slot />
  </div>
</template>

<script setup></script>`,
        fileName: name,
        fileExtension: 'vue'
      },
      page: {
        path: name.includes('/') ? `${rootDirPath}/pages/${name.split('/')[0]}` : `${rootDirPath}/pages`,
        template: `<template>
  <div>${name}</div>
</template>

<script setup></script>`,
        fileName: name.includes('/') ? name.split('/')[1] : name,
        fileExtension: 'vue'
      }
    }

    const { path, template, fileExtension, fileName } = templates[schematic]

    await writeTemplate(path, template, fileExtension, fileName)
  }
})

async function writeTemplate(path: string, template: string, fileExtension: string, fileName: string) {
  if(!(existsSync(path) && readdirSync(path).length)) {
    await fsp.mkdir(path, { recursive: true })
  }

  const newFilePath = resolve(path, `${fileName}.${fileExtension}`)

  await fsp.writeFile(newFilePath, template)
}
