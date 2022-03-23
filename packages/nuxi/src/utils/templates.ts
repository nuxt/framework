import { upperFirst } from 'scule'

export const templates = {
  api: (name: string) => ({
    path: `/server/api/${name}.ts`,
    template: `export default (req, res) => 'Hello ${name}'`
  }),
  plugin: (name: string) => ({
    path: `/plugins/${name}.ts`,
    template: 'export default defineNuxtPlugin(nuxtApp => {})'
  }),
  component: (name: string) => ({
    path: `/components/${name}.vue`,
    template: `<script lang="ts" setup></script>

<template>
  <div>${name}</div>
</template>

<style scoped></style>`
  }),
  composable: (name: string) => ({
    path: `/composables/${!name.includes('use') ? `use${upperFirst(name)}` : name}.ts`,
    template: `export const ${name} = () => {
return useState(${name}, () => 'bar')
}`
  }),
  middleware: (name: string) => ({
    path: `/middleware/${name}.ts`,
    template: 'export default defineNuxtRouteMiddleware((to, from) => {})'
  }),
  layout: (name: string) => ({
    path: `/layouts/${name}.vue`,
    template: `<script lang="ts" setup></script>

<template>
  <div>
    ${name}
    <slot />
  </div>
</template>

<style scoped></style>`
  }),
  page: (name: string) => ({
    path: `/pages/${name}.vue`,
    template: `<script lang="ts" setup></script>

<template>
  <div>${name}</div>
</template>

<style scoped></style>`
  })
}
