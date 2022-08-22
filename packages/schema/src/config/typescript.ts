export default {
  /**
   * Configuration for Nuxt's TypeScript integration.
   *
   * @version 2
   * @version 3
   */
  typescript: {
    /**
     * TypeScript comes with certain checks to give you more safety and analysis of your program.
     * Once you’ve converted your codebase to TypeScript, you can start enabling these checks for greater safety.
     * [Read More](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html#getting-stricter-checks)
     */
    strict: false,

    /**
     * Enable build-time type checking.
     *
     * If set to true, this will type check in development. You can restrict this to build-time type checking by setting it to `build`.
     *
     * @type {boolean | 'build'}
     */
    typeCheck: false,

    /**
     * You can extend generated `.nuxt/tsconfig.json` using this option.
     * @type {typeof import('pkg-types')['readPackageJSON']}
     */
    tsConfig: {},

    /**
     * Generate a `*.vue` shim.
     *
     * We recommend instead either enabling [**Take Over Mode**](https://github.com/johnsoncodehk/volar/discussions/471) or adding **TypeScript Vue Plugin (Volar)** 👉 [[Download](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin)].
     */
    shim: true
  }
}
