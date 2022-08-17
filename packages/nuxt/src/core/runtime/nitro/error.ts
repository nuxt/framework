import { withQuery } from 'ufo'
import type { NitroErrorHandler } from 'nitropack'
import type { H3Error } from 'h3'
import { importModule } from '@nuxt/kit'
import { normalizeError, isJsonRequest } from '#internal/nitro/utils'

export default <NitroErrorHandler> async function errorhandler (error: H3Error, event) {
  // Parse and normalize error
  const { stack, statusCode, statusMessage, message } = normalizeError(error)

  // Create an error object
  const errorObject = {
    url: event.req.url,
    statusCode,
    statusMessage,
    message,
    stack: process.env.NODE_ENV === 'development' && statusCode !== 404
      ? `<pre>${stack.map(i => `<span class="stack${i.internal ? ' internal' : ''}">${i.text}</span>`).join('\n')}</pre>`
      : '',
    data: error.data
  }

  // Set response code and message
  event.res.statusCode = errorObject.statusCode as any as number
  event.res.statusMessage = errorObject.statusMessage

  // Console output
  if (error.unhandled || error.fatal) {
    const tags = [
      '[nuxt]',
      '[request error]',
      error.unhandled && '[unhandled]',
      error.fatal && '[fatal]',
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(' ')
    console.error(tags, errorObject.message + '\n' + stack.map(l => '  ' + l.text).join('  \n'))
  }

  // JSON response
  if (isJsonRequest(event)) {
    event.res.setHeader('Content-Type', 'application/json')
    event.res.end(JSON.stringify(errorObject))
    return
  }

  // HTML response
  const url = withQuery('/__nuxt_error', errorObject)
  let html = await $fetch(url).catch(() => null)

  if (!html) {
    // Fallback to static rendered error page
    console.log('Rendering fallback...')
    const { template } = process.dev
      ? await importModule('@nuxt/ui-templates/templates/error-dev.mjs')
      : await importModule('@nuxt/ui-templates/templates/error-500.mjs')
    html = template({
      ...errorObject,
      description: errorObject.message
    })
  }

  event.res.setHeader('Content-Type', 'text/html;charset=UTF-8')
  event.res.end(html)
}
