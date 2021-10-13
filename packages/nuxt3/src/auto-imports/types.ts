
export type IdentifierInfo = {
  name?: string
  from: string
}
export type IdentifierMap = Record<string, IdentifierInfo>
export type Identifiers = [string, string][]

export interface AutoImportsOptions {
  identifiers?: IdentifierMap
  disabled?: string[]
}
