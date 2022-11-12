import fsp from 'node:fs/promises'
import escapeRE from 'escape-string-regexp'
import { genImport, genDynamicImport, genArrayFromRaw, genSafeVariableName } from 'knitwork'
import { resolveFiles, useNuxt } from '@nuxt/kit'
import { NuxtPage } from '@nuxt/schema'
import { encodePath } from 'ufo'
import { extname, normalize, relative, resolve } from 'pathe'
import { parse } from 'acorn'
import { walk } from 'estree-walker'
import { StaticImport, findStaticImports, parseStaticImport } from 'mlly'
import type { CallExpression, Expression } from 'estree'
import { transformWithEsbuild } from 'vite'
import { parse as parseSFC } from '@vue/compiler-sfc'
import { uniqueBy } from '../core/utils'
import { PAGE_META_MODULE_EXT } from './page-meta'

enum SegmentParserState {
  initial,
  static,
  dynamic,
  optional,
  catchall,
}

enum SegmentTokenType {
  static,
  dynamic,
  optional,
  catchall,
}

interface SegmentToken {
  type: SegmentTokenType
  value: string
}

export async function resolvePagesRoutes (): Promise<NuxtPage[]> {
  const nuxt = useNuxt()

  const pagesDirs = nuxt.options._layers.map(
    layer => resolve(layer.config.srcDir, layer.config.dir?.pages || 'pages')
  )

  const allRoutes = (await Promise.all(
    pagesDirs.map(async (dir) => {
      const files = await resolveFiles(dir, `**/*{${nuxt.options.extensions.join(',')}}`)
      // Sort to make sure parent are listed first
      files.sort()
      return generateRoutesFromFiles(files, dir)
    })
  )).flat()

  return uniqueBy(allRoutes, 'path')
}

export function generateRoutesFromFiles (files: string[], pagesDir: string): NuxtPage[] {
  const routes: NuxtPage[] = []

  for (const file of files) {
    const segments = relative(pagesDir, file)
      .replace(new RegExp(`${escapeRE(extname(file))}$`), '')
      .split('/')

    const route: NuxtPage = {
      name: '',
      path: '',
      file,
      children: []
    }

    // Array where routes should be added, useful when adding child routes
    let parent = routes

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]

      const tokens = parseSegment(segment)
      const segmentName = tokens.map(({ value }) => value).join('')

      // ex: parent/[slug].vue -> parent-slug
      route.name += (route.name && '-') + segmentName

      // ex: parent.vue + parent/child.vue
      const child = parent.find(parentRoute => parentRoute.name === route.name && !parentRoute.path.endsWith('(.*)*'))

      if (child && child.children) {
        parent = child.children
        route.path = ''
      } else if (segmentName === 'index' && !route.path) {
        route.path += '/'
      } else if (segmentName !== 'index') {
        route.path += getRoutePath(tokens)
      }
    }

    parent.push(route)
  }

  return prepareRoutes(routes)
}

function getRoutePath (tokens: SegmentToken[]): string {
  return tokens.reduce((path, token) => {
    return (
      path +
      (token.type === SegmentTokenType.optional
        ? `:${token.value}?`
        : token.type === SegmentTokenType.dynamic
          ? `:${token.value}`
          : token.type === SegmentTokenType.catchall
            ? `:${token.value}(.*)*`
            : encodePath(token.value))
    )
  }, '/')
}

const PARAM_CHAR_RE = /[\w\d_.]/

function parseSegment (segment: string) {
  let state: SegmentParserState = SegmentParserState.initial
  let i = 0

  let buffer = ''
  const tokens: SegmentToken[] = []

  function consumeBuffer () {
    if (!buffer) {
      return
    }
    if (state === SegmentParserState.initial) {
      throw new Error('wrong state')
    }

    tokens.push({
      type:
        state === SegmentParserState.static
          ? SegmentTokenType.static
          : state === SegmentParserState.dynamic
            ? SegmentTokenType.dynamic
            : state === SegmentParserState.optional
              ? SegmentTokenType.optional
              : SegmentTokenType.catchall,
      value: buffer
    })

    buffer = ''
  }

  while (i < segment.length) {
    const c = segment[i]

    switch (state) {
      case SegmentParserState.initial:
        buffer = ''
        if (c === '[') {
          state = SegmentParserState.dynamic
        } else {
          i--
          state = SegmentParserState.static
        }
        break

      case SegmentParserState.static:
        if (c === '[') {
          consumeBuffer()
          state = SegmentParserState.dynamic
        } else {
          buffer += c
        }
        break

      case SegmentParserState.catchall:
      case SegmentParserState.dynamic:
      case SegmentParserState.optional:
        if (buffer === '...') {
          buffer = ''
          state = SegmentParserState.catchall
        }
        if (c === '[' && state === SegmentParserState.dynamic) {
          state = SegmentParserState.optional
        }
        if (c === ']' && (state !== SegmentParserState.optional || buffer[buffer.length - 1] === ']')) {
          if (!buffer) {
            throw new Error('Empty param')
          } else {
            consumeBuffer()
          }
          state = SegmentParserState.initial
        } else if (PARAM_CHAR_RE.test(c)) {
          buffer += c
        } else {
          // eslint-disable-next-line no-console
          // console.debug(`[pages]Ignored character "${c}" while building param "${buffer}" from "segment"`)
        }
        break
    }
    i++
  }

  if (state === SegmentParserState.dynamic) {
    throw new Error(`Unfinished param "${buffer}"`)
  }

  consumeBuffer()

  return tokens
}

function prepareRoutes (routes: NuxtPage[], parent?: NuxtPage) {
  for (const route of routes) {
    // Remove -index
    if (route.name) {
      route.name = route.name.replace(/-index$/, '')
    }

    // Remove leading / if children route
    if (parent && route.path.startsWith('/')) {
      route.path = route.path.slice(1)
    }

    if (route.children?.length) {
      route.children = prepareRoutes(route.children, route)
    }

    if (route.children?.find(childRoute => childRoute.path === '')) {
      delete route.name
    }
  }

  return routes
}

export function normalizeRoutes (routes: NuxtPage[], metaImports: Set<string> = new Set()): { imports: Set<string>, routes: string } {
  return {
    imports: metaImports,
    routes: genArrayFromRaw(routes.map((route) => {
      const file = normalize(route.file)
      const metaImportName = genSafeVariableName(file) + 'Meta'
      metaImports.add(genImport(file + PAGE_META_MODULE_EXT, [{ name: 'default', as: metaImportName }]))

      let aliasCode = `${metaImportName}?.alias || []`
      if (Array.isArray(route.alias) && route.alias.length) {
        aliasCode = `${JSON.stringify(route.alias)}.concat(${aliasCode})`
      }

      return {
        ...Object.fromEntries(Object.entries(route).map(([key, value]) => [key, JSON.stringify(value)])),
        name: `${metaImportName}?.name ?? ${route.name ? JSON.stringify(route.name) : 'undefined'}`,
        path: `${metaImportName}?.path ?? ${JSON.stringify(route.path)}`,
        children: route.children ? normalizeRoutes(route.children, metaImports).routes : [],
        meta: route.meta ? `{...(${metaImportName} || {}), ...${JSON.stringify(route.meta)}}` : metaImportName,
        alias: aliasCode,
        redirect: route.redirect ? JSON.stringify(route.redirect) : `${metaImportName}?.redirect || undefined`,
        component: genDynamicImport(file, { interopDefault: true })
      }
    }))
  }
}

export async function extractMetadata (path: string) {
  const nuxt = useNuxt()
  const source: string | null = nuxt.vfs[path] || await fsp.readFile(path, 'utf-8').catch(() => null)

  if (!source) { return 'export default {}' }
  let code: string | null = source

  // Extract <script> or <script setup> block
  if (path.endsWith('.vue')) {
    const { descriptor } = parseSFC(source)
    const block = descriptor.scriptSetup?.content.includes('definePageMeta') ? descriptor.scriptSetup : descriptor.script

    code = block?.lang
      ? await transformWithEsbuild(block.content, path, { loader: block.lang as 'ts' }).then(r => r.code)
      : block?.content || null
  }

  if (!code) { return 'export default {}' }

  const importMap = new Map<string, StaticImport>()
  for (const i of findStaticImports(code)) {
    const parsed = parseStaticImport(i)
    for (const name of [
      parsed.defaultImport,
      ...Object.keys(parsed.namedImports || {}),
      parsed.namespacedImport
    ].filter(Boolean) as string[]) {
      importMap.set(name, i)
    }
  }

  let contents = 'export default {}'

  walk(parse(code, { ecmaVersion: 'latest', sourceType: 'module', sourceFile: path }), {
    enter (_node) {
      if (_node.type !== 'CallExpression' || (_node as CallExpression).callee.type !== 'Identifier') { return }
      const node = _node as CallExpression & { start: number, end: number }
      const name = 'name' in node.callee && node.callee.name
      if (name !== 'definePageMeta') { return }

      const meta = node.arguments[0] as Expression & { start: number, end: number }

      contents = `export default ${code!.slice(meta.start, meta.end) || '{}'}`

      walk(meta, {
        enter (_node) {
          if (_node.type === 'CallExpression') {
            const node = _node as CallExpression & { start: number, end: number }
            const name = 'name' in node.callee && node.callee.name
            if (name && importMap.has(name)) {
              contents = importMap.get(name)!.code + '\n' + contents
            }
          }
        }
      })
    }
  })

  return contents
}
