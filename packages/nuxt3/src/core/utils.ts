import { resolveFiles, useNuxt } from '@nuxt/kit'
import { basename, extname, resolve } from 'pathe'
import { kebabCase } from 'scule'

export async function resolveLayouts () {
  const nuxt = useNuxt()
  const layoutDir = resolve(nuxt.options.srcDir, nuxt.options.dir.layouts)
  const files = await resolveFiles(layoutDir, `*{${nuxt.options.extensions.join(',')}}`)

  const layouts = files.map(file => ({ name: getNameFromPath(file), file }))
  await nuxt.callHook('pages:layouts:extend', layouts)
  return layouts
}

function getNameFromPath (path: string) {
  return kebabCase(basename(path).replace(extname(path), '')).replace(/["']/g, '')
}
