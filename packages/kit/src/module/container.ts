import type { Nuxt } from '@nuxt/kit'

export default class ModuleContainer {
  nuxt: Nuxt
  options: Nuxt['options']
  requiredModules: Record<string, {
    src: string
    options: Record<string, any>
    handler
  }>

  constructor (nuxt: Nuxt) {
    this.nuxt = nuxt
    this.options = nuxt.options
    this.requiredModules = {}

    // Self bind to allow destructre from container
    for (const method of Object.getOwnPropertyNames(ModuleContainer.prototype)) {
      if (typeof this[method] === 'function') {
        this[method] = this[method].bind(this)
      }
    }
  }

  ready () {
    return Promise.resolve()
  }

  addVendor () {
    console.warn('addVendor has been deprecated')
  }

  addTemplate (template: TemplateInput | string) {
  }

  addPlugin (template: TemplateInput) {

  }

  addLayout (template: TemplateInput, name: string) {
  }

  addErrorLayout (dst: string) {
  }

  addServerMiddleware (middleware) {
  }

  extendBuild (fn) {
  }

  extendRoutes (fn) {
  }

  requireModule (moduleOpts) {
  }

  async addModule (moduleOpts) {
  }
}
