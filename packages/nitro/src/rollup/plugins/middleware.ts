import hasha from 'hasha'
import { relative } from 'upath'
import { table, getBorderCharacters } from 'table'
import isPrimitive from 'is-primitive'
import stdenv from 'std-env'
import type { ServerMiddleware } from '../../server/middleware'
import virtual from './virtual'

export function middleware (getMiddleware: () => ServerMiddleware[]) {
  const getImportId = p => '_' + hasha(p).substr(0, 6)

  let lastDump = ''

  return virtual({
    '#server-middleware': {
      load: () => {
        const middleware = getMiddleware()

        if (stdenv.debug) {
          const dumped = dumpMiddleware(middleware)
          if (dumped !== lastDump) {
            lastDump = dumped
            if (middleware.length) {
              console.log(dumped)
            }
          }
        }

        // Imports take priority
        const imports = middleware.filter(m => m.lazy === false).map(m => m.handle)

        // Lazy imports should fill in the gaps
        const lazyImports = middleware.filter((m, index) =>
          // Skip prior lazy imports and non-lazy imports of the same handle
          !middleware.some((mw, i) => (i < index || m.lazy === false) && mw.handle === m.handle)
        ).map(m => m.handle)

        return `
  ${imports.map(handle => `import ${getImportId(handle)} from '${handle}';`).join('\n')}

  ${lazyImports.map(handle => `const ${getImportId(handle)} = () => import('${handle}');`).join('\n')}

  const middleware = [
    ${middleware.map(m => `{ route: '${m.route}', handle: ${getImportId(m.handle)}, lazy: ${m.lazy || true}, promisify: ${m.promisify !== undefined ? m.promisify : true} }`).join(',\n')}
  ];

  export default middleware
  `
      }
    }
  })
}

function dumpMiddleware (middleware: ServerMiddleware[]) {
  const data = middleware.map(({ route, handle, ...props }) => {
    return [
      (route && route !== '/') ? route : '*',
      relative(process.cwd(), handle as string),
      dumpObject(props)
    ]
  })
  return table([
    ['Route', 'Handle', 'Options'],
    ...data
  ], {
    singleLine: true,
    border: getBorderCharacters('norc')
  })
}

function dumpObject (obj: any) {
  const items = []
  for (const key in obj) {
    const val = obj[key]
    items.push(`${key}: ${isPrimitive(val) ? val : JSON.stringify(val)}`)
  }
  return items.join(', ')
}
