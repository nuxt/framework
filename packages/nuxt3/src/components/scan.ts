import { basename, extname, join, dirname, relative } from 'pathe'
import globby from 'globby'
import { pascalCase, splitByCase } from 'scule'
import type { ScanDir, Component, ComponentsDir } from '@nuxt/kit'

export function sortDirsByPathLength ({ path: pathA }: ScanDir, { path: pathB }: ScanDir): number {
  return pathB.split(/[\\/]/).filter(Boolean).length - pathA.split(/[\\/]/).filter(Boolean).length
}

// vue@2 src/shared/util.js
// TODO: update to vue3?
function hyphenate (str: string):string {
  return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

/**
 * Scan the components inside different components folders
 *
 * @param dirs list and create a context where components are defined
 * @param srcDir src path of your app
 * @returns {Promise} Component found promise
 */
export async function scanComponents (dirs: ComponentsDir[], srcDir: string): Promise<Component[]> {
  /**
   * all the components find
   */
  const components: Component[] = []
  /**
   * memore filePaths to not have duplicate
   */
  const filePaths = new Set<string>()
  /**
   * all the paths scanned
   */
  const scannedPaths: string[] = []

  for (const {
    path,
    pattern,
    ignore = [],
    prefix,
    extendComponent,
    pathPrefix,
    level,
    prefetch = false,
    preload = false
  } of dirs.sort(sortDirsByPathLength)) {
    /**
     * memory resolve components names from components folders
     */
    const resolvedNames = new Map<string, string>()

    for (const _file of await globby(pattern!, { cwd: path, ignore })) {
      /**
       * full file path
       */
      const filePath = join(path, _file)

      // TODO: better comment check if already checked if the component has been already scanned or not
      if (scannedPaths.find(d => filePath.startsWith(d))) {
        continue
      }

      // TODO: add good comment of the condition
      if (filePaths.has(filePath)) { continue }
      filePaths.add(filePath)

      /**
       * create an array of prefixes base on the prefix config
       * empty prefix will be an empty array
       *
       * @example prefix: 'nuxt' -> ['nuxt']
       * @example prefix: 'nuxt-test' -> ['nuxt', 'test']
       * TODO: not sure about the second path
       */
      const prefixParts = ([] as string[]).concat(
        prefix ? splitByCase(prefix) : [],
        pathPrefix !== false ? splitByCase(relative(path, dirname(filePath))) : []
      )

      /**
       * in case you have index as filename the component become the parent path
       *
       * @example third-components/index.vue -> third-component
       * if not take the filename
       * @example thid-components/Awesome.vue -> Awesome
       */
      let fileName = basename(filePath, extname(filePath))

      if (fileName.toLowerCase() === 'index') {
        fileName = pathPrefix === false ? basename(dirname(filePath)) : '' /* inherits from path */
      }

      /**
       * array of fileName part
       *
       * @example third-component -> ['third', 'component']
       * @example AwesomeComponent -> ['AwesomeComponents']
       */
      const fileNameParts = splitByCase(fileName)

      const componentNameParts: string[] = []

      while (prefixParts.length &&
        (prefixParts[0] || '').toLowerCase() !== (fileNameParts[0] || '').toLowerCase()
      ) {
        componentNameParts.push(prefixParts.shift()!)
      }

      const componentName = pascalCase(componentNameParts) + pascalCase(fileNameParts)

      // console.log('-------')
      // console.log('file name: ', fileName)
      // console.log('fileNameParts: ', fileNameParts)
      // console.log('components parts: ', componentNameParts)
      // console.log('componentName: ', componentName)
      // console.log('-------')

      // TODO: test this case
      if (resolvedNames.has(componentName)) {
        console.warn(`Two component files resolving to the same name \`${componentName}\`:\n` +
          `\n - ${filePath}` +
          `\n - ${resolvedNames.get(componentName)}`
        )
        continue
      }
      resolvedNames.set(componentName, filePath)

      const pascalName = pascalCase(componentName).replace(/["']/g, '')
      const kebabName = hyphenate(componentName)
      const shortPath = relative(srcDir, filePath)
      const chunkName = 'components/' + kebabName

      console.log('-------')
      console.log('pascalName: ', pascalName)
      console.log('kebabName: ', kebabName)
      console.log('shortPath: ', shortPath)
      console.log('chunkName: ', chunkName)
      console.log('-------')

      let component: Component = {
        filePath,
        pascalName,
        kebabName,
        chunkName,
        shortPath,
        export: 'default',
        global: Boolean(global), // TOOD: deprecated why not remove it here ?
        level: Number(level),
        prefetch: Boolean(prefetch),
        preload: Boolean(preload)
      }

      // TODO: not sure about this here
      if (typeof extendComponent === 'function') {
        component = (await extendComponent(component)) || component
      }

      // Check if component is already defined, used to overwite if level is inferiour
      const definedComponent = components.find(c => c.pascalName === component.pascalName)
      if (definedComponent && component.level < definedComponent.level) {
        Object.assign(definedComponent, component)
      } else if (!definedComponent) {
        components.push(component)
      }
    }

    scannedPaths.push(path)
  }

  return components
}
