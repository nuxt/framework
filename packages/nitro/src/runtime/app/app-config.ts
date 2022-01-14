import { joinURL } from 'ufo'
import config from '#config'

interface ComputedAppConfig {
  buildAssetsPath: string
  buildAssetsURL: string
  publicAssetsURL: string
  routerBase: string
}

const app = {} as ComputedAppConfig

Object.defineProperties(app, {
  buildAssetsPath: {
    get () {
      return config.app.buildAssetsPath
    }
  },
  buildAssetsURL: {
    get () {
      return joinURL(app.publicAssetsURL, config.app.buildAssetsPath)
    }
  },
  publicAssetsURL: {
    get () {
      return config.app.cdnURL || config.app.basePath
    }
  },
  routerBase: {
    get () {
      return config.app.basePath
    }
  }
})

export default app
