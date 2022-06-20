import { NuxtTemplate } from '@nuxt/schema'
import { join, parse } from 'pathe'
import { isNuxt2 } from './compatibility'
import { useNuxt } from './context'
import { logger } from './logger'
import { addTemplate } from './template'

export function addLayout (tmpl: NuxtTemplate, name?: string) {
  const nuxt = useNuxt()
  const { filename, src } = addTemplate(tmpl)
  const layoutName = name || parse(src || filename).name

  if (isNuxt2(nuxt)) {
    // Nuxt 2 adds layouts in options
    const layout = nuxt.options.layouts[layoutName]
    if (layout) {
      logger.warn(`Duplicate layout registration, "${layoutName}" has been registered as "${layout}"`)
    }
    nuxt.options.layouts[layoutName] = `./${filename}`
    if (name === 'error') {
      this.addErrorLayout(filename)
    }
  } else {
    // Nuxt 3 adds layouts on app
    nuxt.hook('app:templates', (app) => {
      app.layouts[layoutName] = {
        file: join('#build', filename),
        name: layoutName
      }
    })
  }
}
