// import ansiHTML from 'ansi-html'
import { template } from '@nuxt/design/dist/templates/error-500'
const cwd = process.cwd()

// TODO: Handle process.env.DEBUG
export function handleError (error, req, res) {
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

  console.error(error.message + '\n' + stack.map(l => '  ' + l.text).join('  \n'))

  const html = template({
    error_server: (error.statusCode || 500),
    name: 'Nuxt Error',
    error_server_message: `
    <h1>${error.toString()}</h1>
    <pre>${stack.map(i =>
      `<span class="stack${i.internal ? ' internal' : ''}">${i.text}</span>`
      ).join('\n')}</pre>`
  })

  res.statusCode = error.statusCode || 500
  res.statusMessage = error.statusMessage || 'Internal Error'
  res.end(html)
}
