export type IdentifierMap = Record<string, string>
export type Identifiers = [string, string][]

export interface AutoImport {
  /**
   * Export name to be imported
   *
   */
  name: string
  /**
   *  Import as this name
   */
  as: string
  /**
   * Module specifier to import from
   */
  from: string
}

export interface AutoImportSource {
  /**
   * Exports from module for auto-import
   *
   */
  names: (string | { name: string, as?: string })[]
  /**
   *  Module specifier to import from
   */
  from: string
}

export interface AutoImportsOptions {
  /**
   * Auto import sources
   */
  sources?: AutoImportSource[]
  /**
   * [experimental] Use globalThis injection instead of transform for development
   */
  global?: boolean
}
