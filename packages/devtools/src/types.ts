import { Nuxt } from '@nuxt/kit'

export interface DevtoolsContext {
  state: { [key: string]: any }
  nuxt?: Nuxt
}

export interface DevtoolActionResult {
}

export type DevtoolActionHandler =
  (opts: any, ctx: DevtoolsContext) => DevtoolActionResult | Promise<DevtoolActionResult>

export interface DevtoolsWidget {
}

export interface DevtoolsService {
  name: string
  widgets: DevtoolsWidget[],
  actions: {
    [name: string]: DevtoolActionHandler
  }
}
