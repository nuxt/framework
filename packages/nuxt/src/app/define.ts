import type { AppConfigInput } from '@nuxt/schema'

export function defineAppConfig<C extends AppConfigInput> (config: C): C {
  return config
}
