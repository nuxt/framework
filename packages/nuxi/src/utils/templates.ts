import { upperFirst } from 'scule'

interface Template {
  (options: { name: string }): { path: string, template: string }
}

const api: Template = ({ name }) => ({
  path: `/server/api/${name}.ts`,
  template: `
import { defineHandle } from 'h3'
export default defineHandle((req, res) => {
  return 'Hello ${name}'
})
`
})

const plugin: Template = ({ name }) => ({
  path: `/plugins/${name}.ts`,
  template: `
export default defineNuxtPlugin(nuxtApp => {})
  `
})

const component: Template = ({ name }) => ({
  path: `/components/${name}.vue`,
  template: `
<script lang="ts" setup></script>

<template>
<div>${name}</div>
</template>

<style scoped></style>
`
})

const composable: Template = ({ name }) => ({
  path: `/composables/${!name.includes('use') ? `use${upperFirst(name)}` : name}.ts`,
  template: `
export const ${name} = () => {
return useState(${name}, () => 'bar')
}
`
})

const middleware: Template = ({ name }) => ({
  path: `/middleware/${name}.ts`,
  template: `
export default defineNuxtRouteMiddleware((to, from) => {})
`
})

const layout: Template = ({ name }) => ({
  path: `/layouts/${name}.vue`,
  template: `
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
  path: `/pages/${name}.vue`,
  template: `
<script lang="ts" setup></script>

<template>
<div>
  Page: ${name}
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
}
