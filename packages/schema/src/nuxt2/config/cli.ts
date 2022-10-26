import { defineUntypedSchema } from 'untyped'

export default defineUntypedSchema({
  cli: {
    /**
   * Add a message to the CLI banner by adding a string to this array.
   * @type {string[]}
   */
    badgeMessages: [],

    /**
     * Change the color of the 'Nuxt.js' title in the CLI banner.
     */
    bannerColor: 'green'
  }
})
