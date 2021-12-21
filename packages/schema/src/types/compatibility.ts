export interface NuxtCompatibility {
  /**
   * Required nuxt version. for example, `^2.14.0` or `>=3.0.0-27219851.6e49637`.
   *
   */
  nuxt?: string

  /**
   * Special requirements for the module
  */
  requires?: {
    /**
     * Nuxt 2 bridge compatibility
     *
    * - `undefined` `false`: Bridge is not supported
     * - `true`: Having bridge is necessary for this module
     * - `optional`: Module should work with/without bridge
     */
    bridge?: boolean | 'optional'
  }
}

export interface NuxtCompatibilityIssue {
  name: string
  message: string
}

export interface NuxtCompatibilityIssues extends Array<NuxtCompatibilityIssue> {
  /**
   * Return formatted error message
   */
  toString(): string
}
