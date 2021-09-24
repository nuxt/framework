// @ts-ignore
import { renderToString as render } from 'vue/server-renderer/index.mjs'

export const renderToString: typeof render = (...args) => {
  return render(...args).then(result => `<div id="__nuxt">${result}</div>`)
}
