import { basename, extname, join, dirname, relative } from 'pathe'
import { globby } from 'globby'
import { pascalCase, splitByCase } from 'scule'
import type { ScanDir, Component, ComponentsDir, ComponentEnv } from '@nuxt/schema'
import { isIgnored } from '@nuxt/kit'

export function sortDirsByPathLength ({ path: pathA }: ScanDir, { path: pathB }: ScanDir): number {
  return pathB.split(/[\\/]/).filter(Boolean).length - pathA.split(/[\\/]/).filter(Boolean).length
}

// vue@2 src/shared/util.js
// TODO: update to vue3?
function hyphenate (str: string): string {
  return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

function resolveEnvComponent (fileName:string) {
  const match = fileName.match(/^(.+)\.(client|server)$/)
  if (match) {
    return {
      fileName: match[1],
      env: match[2] as ComponentEnv
    }
  } else {
    return {
      fileName,
      env: undefined
    }
  }
}

/**
 * Scan the components inside different components folders
 * and return a unique list of components
 *
 * @param dirs all folders where components are defined
 * @param srcDir src path of your app
 * @returns {Promise} Component found promise
 */
export async function scanComponents (dirs: ComponentsDir[], srcDir: string): Promise<Component[]> {
  // All scanned components
  const components: Component[] = []

  // Keep resolved path to avoid duplicates
  const filePaths = new Set<string>()

  // All scanned paths
  const scannedPaths: string[] = []

  for (const dir of dirs.sort(sortDirsByPathLength)) {
    for (const _file of await globby(dir.pattern!, { cwd: dir.path, ignore: dir.ignore })) {
      const filePath = join(dir.path, _file)

      if (scannedPaths.find(d => filePath.startsWith(d)) || isIgnored(filePath)) {
        continue
      }

      // Avoid duplicate paths
      if (filePaths.has(filePath)) { continue }

      filePaths.add(filePath)

      /**
       * Create an array of prefixes base on the prefix config
       * Empty prefix will be an empty array
       *
       * @example prefix: 'nuxt' -> ['nuxt']
       * @example prefix: 'nuxt-test' -> ['nuxt', 'test']
       */
      const prefixParts = ([] as string[]).concat(
        dir.prefix ? splitByCase(dir.prefix) : [],
        (dir.pathPrefix !== false) ? splitByCase(relative(dir.path, dirname(filePath))) : []
      )
      let env: ComponentEnv | undefined

      /**
       * In case we have index as filename the component become the parent path
       *
       * @example third-components/index.vue -> third-component
       * if not take the filename
       * @example thid-components/Awesome.vue -> Awesome
       */
      let fileName = basename(filePath, extname(filePath))

      if (fileName.toLowerCase() === 'index') {
        fileName = dir.pathPrefix === false ? basename(dirname(filePath)) : '' /* inherits from path */
      }
      // eslint-disable-next-line prefer-const
      ({ env, fileName } = resolveEnvComponent(fileName))

      /**
       * Array of fileName parts splitted by case, / or -
       *
       * @example third-component -> ['third', 'component']
       * @example AwesomeComponent -> ['Awesome', 'Component']
       */
      const fileNameParts = splitByCase(fileName)

      const componentNameParts: string[] = []

      while (prefixParts.length &&
        (prefixParts[0] || '').toLowerCase() !== (fileNameParts[0] || '').toLowerCase()
      ) {
        componentNameParts.push(prefixParts.shift()!)
      }

      const componentName = pascalCase(componentNameParts) + pascalCase(fileNameParts)
      const pascalName = pascalCase(componentName).replace(/["']/g, '')
      const kebabName = hyphenate(componentName)
      const shortPath = relative(srcDir, filePath)
      const chunkName = 'components/' + kebabName

      let component: Component = {
        filePath,
        pascalName,
        kebabName,
        chunkName,
        shortPath,
        export: 'default',
        global: dir.global,
        prefetch: Boolean(dir.prefetch),
        preload: Boolean(dir.preload)
      }

      if (env) {
        component.envPaths = {
          [env]: filePath
        }
      }

      if (typeof dir.extendComponent === 'function') {
        component = (await dir.extendComponent(component)) || component
      }

      // Check if component is already defined
      const definedComponent = components.find(c => c.pascalName === component.pascalName)
      if (!definedComponent) {
        // Not defined, add component
        components.push(component)
      } else if (component.level < definedComponent.level) {
        // Overwite if level is inferiour
        Object.assign(definedComponent, component)
      } else if (definedComponent.envPaths && component.envPaths) {
        // Merge client and server component path
        Object.assign(definedComponent.envPaths, component.envPaths)
      } else {
        // Naming conflict warning, ignore the later one
        console.warn(`Two component files resolving to the same name \`${componentName}\`:\n` +
          `\n - ${filePath}` +
          `\n - ${definedComponent.filePath}`
        )
      }
    }
    scannedPaths.push(dir.path)
  }

  return components
}
