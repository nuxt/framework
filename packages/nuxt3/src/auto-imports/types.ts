
export type IdentifierMeta = string | {
  name?: string
  from: string
}
export type IdentifierMap = Record<string, IdentifierMeta>
export type Identifiers = [string, string][]

export interface AutoImportsOptions {
  identifiers?: IdentifierMap
  disabled?: string[]
}
