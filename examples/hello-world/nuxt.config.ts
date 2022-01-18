import { defineNuxtConfig } from 'nuxt3'
import {useNuxt} from "@nuxt/kit";

export default defineNuxtConfig({
  hooks: {
    listen (server, listener) {
      const nuxt = useNuxt()
      console.log(nuxt.server.app, server.address(), listener)
    },
  }
})
