export type IdentifierMap = Record<string, string>
export type Identifiers = [string, string][]

export interface AutoImportsOptions {
  identifiers?: IdentifierMap
  disabled?: string[]
}

type autoImportsIdentifiersHook = (identifiers: IdentifierMap) => void | Promise<void>

declare module '@nuxt/kit' {
  interface NuxtOptions {
    autoImports?: AutoImportsOptions | false
  }
  interface NuxtOptionsHooks {
    'auto-imports:identifiers': autoImportsIdentifiersHook
  }
}
