import { upperFirst } from 'scule'

interface TemplateOptions {
  name: string
  mode?: 'client' | 'server'
}
interface Template {
  (options: TemplateOptions): { path: string, contents: string }
}

const suffixMode = (opts: TemplateOptions): string => {
  return !opts.mode ? opts.name : `${opts.name}.${opts.mode}`
}

const api: Template = ({ name }) => ({
  path: `server/api/${name}.ts`,
  contents: `
import { defineHandle } from 'h3'

export default defineHandle((req, res) => {
  return 'Hello ${name}'
})
`
})

const plugin: Template = opts => ({
  path: `plugins/${suffixMode(opts)}.ts`,
  contents: `
export default defineNuxtPlugin((nuxtApp) => {})
  `
})

const component: Template = ({ name }) => ({
  path: `components/${name}.vue`,
  contents: `
<script lang="ts" setup></script>

<template>
  <div>
    Component: ${name}
  </div>
</template>

<style scoped></style>
`
})

const composable: Template = ({ name }) => {
  const nameWithUsePrefix = name.startsWith('use') ? name : `use${upperFirst(name)}`
  return {
    path: `composables/${name}.ts`,
    contents: `
export const ${nameWithUsePrefix} = () => {
  return ref()
}
  `
  }
}

const middleware: Template = ({ name }) => ({
  path: `middleware/${name}.ts`,
  contents: `
export default defineNuxtRouteMiddleware((to, from) => {})
`
})

const layout: Template = ({ name }) => ({
  path: `layouts/${name}.vue`,
  contents: `
<script lang="ts" setup></script>

<template>
  <div>
    Layout: ${name}
    <slot />
  </div>
</template>

<style scoped></style>
`
})

const page: Template = ({ name }) => ({
  path: `pages/${name}.vue`,
  contents: `
<script lang="ts" setup></script>

<template>
  <div>
    Page: foo
  </div>
</template>

<style scoped></style>
`
})

export const templates = {
  api,
  plugin,
  component,
  composable,
  middleware,
  layout,
  page
} as Record<string, Template>

export const modeSupported = (template: string) => ['plugin'].includes(template)
