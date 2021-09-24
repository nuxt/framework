import { createHooks } from 'hookable/dist/index.mjs'

export default (ctx, inject) => {
  const payload = process.client ? ctx.nuxtState : ctx.ssrContext.nuxt
  const nuxt = {
    provide: inject,
    globalName: 'nuxt',
    state: payload.state,
    payload,
    isHydrating: ctx.isHMR
  }
  nuxt.hooks = createHooks()
  nuxt.hook = nuxt.hooks.hook
  nuxt.callHook = nuxt.hooks.callHook

  if (!Array.isArray(ctx.app.created)) {
    ctx.app.created = [ctx.app.created]
  }

  ctx.app.created.push(function () {
    nuxt.app = this
  })

  inject('_nuxtApp', nuxt)
}
