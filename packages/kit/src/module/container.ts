import type { Nuxt } from '../nuxt'
import { addTemplate, TemplateOpts } from './template'
import { installModule } from './install'
import {
  addErrorLayout,
  addLayout,
  addPlugin,
  addServerMiddleware,
  extendBuild,
  extendRoutes
} from './utils'

export class ModuleContainer {
  nuxt: Nuxt
  options: Nuxt['options']
  requiredModules: Record<string, { src: string, options: any, handler: Function }>

  constructor (nuxt: Nuxt) {
    this.nuxt = nuxt
    this.options = nuxt.options
    this.requiredModules = {}
  }

  ready () {
    return Promise.resolve()
  }

  addVendor () {
    console.warn('addVendor has been deprecated')
  }

  addTemplate (tmpl: TemplateOpts | string) {
    return addTemplate(tmpl)
  }

  addPlugin (tmpl: TemplateOpts) {
    return addPlugin(tmpl)
  }

  addLayout (tmpl: TemplateOpts, name: string) {
    return addLayout(tmpl, name)
  }

  addErrorLayout (dst: string) {
    return addErrorLayout(dst)
  }

  addServerMiddleware (middleware) {
    return addServerMiddleware(middleware)
  }

  extendBuild (fn) {
    return extendBuild(fn)
  }

  extendRoutes (fn) {
    return extendRoutes(fn)
  }

  requireModule (moduleOpts) {
    return installModule(moduleOpts)
  }

  addModule (moduleOpts) {
    return installModule(moduleOpts)
  }
}
