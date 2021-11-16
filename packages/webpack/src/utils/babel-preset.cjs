const coreJsMeta = {
  2: {
    prefixes: {
      es6: 'es6',
      es7: 'es7'
    },
    builtIns: '@babel/compat-data/corejs2-built-ins'
  },
  3: {
    prefixes: {
      es6: 'es',
      es7: 'es'
    },
    builtIns: 'core-js-compat/data'
  }
}

function getDefaultPolyfills (corejs) {
  const { prefixes: { es6, es7 } } = coreJsMeta[corejs.version]
  return [
    // Promise polyfill alone doesn't work in IE,
    // Needs this as well. see: #1642
    `${es6}.array.iterator`,
    // This is required for webpack code splitting, vuex etc.
    `${es6}.promise`,
    // this is needed for object rest spread support in templates
    // as vue-template-es2015-compiler 1.8+ compiles it to Object.assign() calls.
    `${es6}.object.assign`,
    // #2012 es7.promise replaces native Promise in FF and causes missing finally
    `${es7}.promise.finally`
  ]
}

function getPolyfills (targets, includes, { ignoreBrowserslistConfig, configPath, corejs }) {
  const { default: getTargets, isRequired } = require('@babel/helper-compilation-targets')
  const builtInsList = require(coreJsMeta[corejs.version].builtIns)
  const builtInTargets = getTargets(targets, {
    ignoreBrowserslistConfig,
    configPath
  })

  return includes.filter(item => isRequired(
    'nuxt-polyfills',
    builtInTargets,
    {
      compatData: { 'nuxt-polyfills': builtInsList[item] }
    }
  ))
}

function isPackageHoisted (packageName) {
  const path = require('pathe')
  const installedPath = path.normalize(require.resolve(packageName))
  const relativePath = path.resolve(__dirname, '..', 'node_modules', packageName)
  return installedPath !== relativePath
}

module.exports = (api, options = {}) => {
  const presets = []
  const plugins = []

  const envName = api.env()

  const {
    bugfixes,
    polyfills: userPolyfills,
    loose = false,
    debug = false,
    useBuiltIns = 'usage',
    modules = false,
    spec,
    ignoreBrowserslistConfig = envName === 'modern',
    configPath,
    include,
    exclude,
    shippedProposals,
    forceAllTransforms,
    decoratorsBeforeExport,
    decoratorsLegacy,
    absoluteRuntime
  } = options

  let { corejs = { version: 3 } } = options

  if (typeof corejs !== 'object') {
    corejs = { version: Number(corejs) }
  }

  const isCorejs3Hoisted = isPackageHoisted('core-js')
  if (
    (corejs.version === 3 && !isCorejs3Hoisted) ||
    (corejs.version === 2 && isCorejs3Hoisted)
  ) {
    // eslint-disable-next-line no-console
    (console.fatal || console.error)(`babel corejs option is ${corejs.version}, please directly install core-js@${corejs.version}.`)
  }

  const defaultTargets = {
    server: { node: 'current' },
    client: { ie: 9 },
    modern: { esmodules: true }
  }

  let { targets = defaultTargets[envName] } = options

  // modern mode can only be { esmodules: true }
  if (envName === 'modern') {
    targets = defaultTargets.modern
  }

  const polyfills = []

  if (envName === 'client' && useBuiltIns === 'usage') {
    polyfills.push(
      ...getPolyfills(
        targets,
        userPolyfills || getDefaultPolyfills(corejs),
        {
          ignoreBrowserslistConfig,
          configPath,
          corejs
        }
      )
    )
    plugins.push([polyfillsPlugin, { polyfills }])
  }

  // Pass options along to babel-preset-env
  presets.push([
    require('@babel/preset-env'), {
      bugfixes,
      spec,
      loose,
      debug,
      modules,
      targets,
      useBuiltIns,
      corejs,
      ignoreBrowserslistConfig,
      configPath,
      include,
      exclude: polyfills.concat(exclude || []),
      shippedProposals,
      forceAllTransforms
    }
  ], [
    require('@babel/preset-typescript')
  ])

  // JSX
  if (options.jsx !== false) {
    // presets.push([require('@vue/babel-preset-jsx'), Object.assign({}, options.jsx)])
  }

  plugins.push(
    [require('@babel/plugin-proposal-decorators'), {
      decoratorsBeforeExport,
      legacy: decoratorsLegacy !== false
    }],
    [require('@babel/plugin-proposal-class-properties'), { loose: true }]
  )

  // Transform runtime, but only for helpers
  plugins.push([require('@babel/plugin-transform-runtime'), {
    regenerator: useBuiltIns !== 'usage',
    corejs: false,
    helpers: useBuiltIns === 'usage',
    useESModules: envName !== 'server',
    absoluteRuntime
  }])

  return {
    sourceType: 'unambiguous',
    presets,
    plugins
  }
}

// Add polyfill imports to the first file encountered.
function polyfillsPlugin ({ _types }) {
  let entryFile
  return {
    name: 'inject-polyfills',
    visitor: {
      Program (path, state) {
        if (!entryFile) {
          entryFile = state.filename
        } else if (state.filename !== entryFile) {
          return
        }

        const { polyfills } = state.opts
        const { createImport } = require('@babel/preset-env/lib/utils')

        // Imports are injected in reverse order
        polyfills.slice().reverse().forEach((p) => {
          createImport(path, p)
        })
      }
    }
  }
}
