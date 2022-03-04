// import ansiHTML from 'ansi-html'
import type { IncomingMessage, ServerResponse } from 'http'
import { error500, error404, errorDev } from '@nuxt/design'
import { localCall } from '.'
const cwd = process.cwd()

const hasReqHeader = (req, header, includes) => req.headers[header] && req.headers[header].toLowerCase().includes(includes)

const isDev = process.env.NODE_ENV === 'development'

export async function handleError (error, req: IncomingMessage, res: ServerResponse) {
  const isJsonRequest = hasReqHeader(req, 'accept', 'application/json') || hasReqHeader(req, 'user-agent', 'curl/') || hasReqHeader(req, 'user-agent', 'httpie/')

  const stack = (error.stack || '')
    .split('\n')
    .splice(1)
    .filter(line => line.includes('at '))
    .map((line) => {
      const text = line
        .replace(cwd + '/', './')
        .replace('webpack:/', '')
        .replace('.vue', '.js') // TODO: Support sourcemap
        .trim()
      return {
        text,
        internal: (line.includes('node_modules') && !line.includes('.cache')) ||
          line.includes('internal') ||
          line.includes('new Promise')
      }
    })

  const is404 = error.statusCode === 404

  const errorObject = {
    statusCode: error.statusCode || 500,
    statusMessage: error.statusMessage ?? is404 ? 'Page Not Found' : 'Internal Server Error',
    message: error.message || error.toString(),
    description: isDev && !is404
      ? `
    <h1>${error.message}</h1>
    <pre>${stack.map(i => `<span class="stack${i.internal ? ' internal' : ''}">${i.text}</span>`).join('\n')}</pre>
    `
      : ''
  }

  res.statusCode = errorObject.statusCode
  res.statusMessage = errorObject.statusMessage

  // Console output
  if (!is404) {
    console.error(error.message + '\n' + stack.map(l => '  ' + l.text).join('  \n'))
  }

  // JSON response
  if (isJsonRequest) {
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify(errorObject))
  }

  // HTML response
  const fallbackTemplate = is404 ? error404 : (isDev ? errorDev : error500)
  const { body: html } = await localCall({
    url: '/_error',
    headers: req.headers,
    body: { url: req.url, error: errorObject }
  })
  res.setHeader('Content-Type', 'text/html;charset=UTF-8')
  res.end(html || fallbackTemplate(errorObject))
}
