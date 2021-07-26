export * from './composables'

declare module '@nuxt/kit' {
  interface NuxtConfig {
    meta?: {
      /**
       * The character encoding in which the document is encoded => `<meta charset="<value>" />`
       *
       * @default `'utf-8'`
       */
      charset?: string
      /**
       * Configuration of the viewport (the area of the window in which web content can be seen),
       * mapped to => `<meta name="viewport" content="<value>" />`
       *
       * @default `'width=device-width, initial-scale=1'`
       */
      viewport?: string
    },
  }
}
