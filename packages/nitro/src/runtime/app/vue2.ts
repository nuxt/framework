// @ts-ignore
import { createRenderer } from '~vueServerRenderer'

const _renderer = createRenderer({})

export function renderToString (component, context) {
  return new Promise((resolve, reject) => {
    _renderer.renderToString(component, context, (err, result) => {
      if (err) {
        return reject(err)
      }
      context.nuxt.hooks.callHook('vue-renderer:done')
      return resolve(result)
    })
  })
}
