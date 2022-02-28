import { existsSync, readFileSync } from 'fs'
import ignore, { Ignore } from 'ignore'
import { join, relative } from 'pathe'
import { useNuxt } from './context'

export interface NuxtIgnore {
  shouldIgnoreFile: (pathname: string) => boolean
}

/**
 * Return a filter function to filter an array of paths
 */
export function useIgnore (nuxt = useNuxt()): NuxtIgnore {
  nuxt._ignore = nuxt._ignore || createIgnore()

  const shouldIgnoreFile = (pathname: string) => {
    const relativePath = relative(nuxt.options.rootDir, pathname)
    if (relativePath.startsWith('..')) {
      return false
    }
    return relativePath && nuxt._ignore.ignores(relativePath)
  }

  return {
    shouldIgnoreFile
  }
}

// --- Internal ---
function createIgnore (): Ignore {
  const nuxt = useNuxt()

  const manager = ignore(nuxt.options.ignoreOptions)
  manager.add(nuxt.options.ignore)

  const nuxtignoreFile = join(nuxt.options.rootDir, '.nuxtignore')
  if (existsSync(nuxtignoreFile)) {
    manager.add(readFileSync(nuxtignoreFile, 'utf-8'))
  }

  return manager
}
