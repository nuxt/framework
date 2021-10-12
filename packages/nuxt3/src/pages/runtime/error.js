import { h } from 'vue'
import { error404, error500, errorDev } from '@nuxt/design'

function extractBody (html) {
  const { bodyAttrs, content } = html.match(/<body(?<bodyAttrs>[^>]*)>(?<content>[\s\S]*)<\/body>/)?.groups || {}
  return '<div' + bodyAttrs + '>' + content + '</div>'
}

function extractStyle (html) {
  const { style } = html.match(/<style>(?<style>[\s\S]*)<\/style>/)?.groups || []
  return style
}

function templateToVNode (html) {
  const style = extractStyle(html)
  const body = extractBody(html)

  return h('div', {
    innerHTML: '<style>' + style + '</style>' + body
  })
}

export default {
  props: {
    errors: Array
  },
  setup (props) {
    return () => {
      const error =
        props.errors.find(e => e && e.statusCode === 404) || props.errors[0] || {}

      const template = error.statusCode === 404
        ? error404
        : process.dev
          ? errorDev
          : error500

      return templateToVNode(template({
        ...error,
        statusCode: error.statusCode || 500,
        statusMessage: error.name,
        description: error.message
      }))
    }
  }
}
