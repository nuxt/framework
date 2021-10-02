export default {
  components: true,
  buildModules: [
    '@nuxt/bridge'
  ],
  serverMiddleware: [
    {
      handle (req, _res, next) {
        req.spa = req.url.includes('?spa')
        next()
      }
    }
  ],
  buildDir: process.env.NITRO_BUILD_DIR,
  plugins: ['~/plugins/setup.js'],
  nitro: {
    output: { dir: process.env.NITRO_OUTPUT_DIR }
  }
}
