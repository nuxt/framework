export interface Identifier {
  name: string
  module: string
}

export type IdentifierMap = Record<string, Identifier>
