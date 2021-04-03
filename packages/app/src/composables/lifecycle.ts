import type { SetupContext } from 'vue'

import { useNuxt } from '@nuxt/app'

/**
 * Run a callback function in the global setup function. This should be called from a Nuxt plugin.
 * @param setupFn The function to run in the setup function. It receives the global context only.
 * @example
    ```ts
    import { onGlobalSetup } from '@nuxt/app'

    export default () => {
      onGlobalSetup(() => {
        provide('globalKey', true)
      })
    }
    ```
 */
export const onGlobalSetup = (setupFn: (context: SetupContext) => void) => {
  const nuxt = useNuxt()
  nuxt._globalSetups.push(setupFn)
}
