import { basename, extname } from 'path'
import { resolve } from 'upath'
import { Nuxt, resolveFiles } from '@nuxt/kit'

export async function resolveLayouts (nuxt: Nuxt) {
  const layoutDir = resolve(nuxt.options.srcDir, nuxt.options.dir.layouts)
  const files = await resolveFiles(layoutDir, `**/*{${nuxt.options.extensions.join(',')}}`)

  return Object.fromEntries(files.map((file) => {
    // TODO: extract shared naming conventions from nuxt/components
    const name = basename(file).replace(extname(file), '')
    return [name, `{() => import('${file}')}`]
  }))
}
