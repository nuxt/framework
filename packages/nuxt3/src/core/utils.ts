import { resolveFiles, useNuxt } from '@nuxt/kit'
import { NuxtMiddleware } from '@nuxt/schema'
import { basename, extname, resolve } from 'pathe'
import { kebabCase, pascalCase } from 'scule'

export function getNameFromPath (path: string) {
  return kebabCase(basename(path).replace(extname(path), '')).replace(/["']/g, '').replace('.global', '')
}

export function hasSuffix (path: string, suffix: string) {
  return basename(path).replace(extname(path), '').endsWith(suffix)
}

export function getImportName (name: string) {
  return pascalCase(name).replace(/[^\w]/g, '')
}

export async function resolveMiddleware (): Promise<NuxtMiddleware[]> {
  const nuxt = useNuxt()
  const middlewareDir = resolve(nuxt.options.srcDir, nuxt.options.dir.middleware)
  const files = await resolveFiles(middlewareDir, `*{${nuxt.options.extensions.join(',')}}`)
  const middleware = files.map(path => ({ name: getNameFromPath(path), path, global: hasSuffix(path, '.global') }))
  await nuxt.callHook('pages:middleware:extend', middleware)
  return middleware
}
