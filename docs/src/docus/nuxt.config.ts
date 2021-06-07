import { withDocus } from 'docus'

export default withDocus({
  rootDir: __dirname,
  buildModules: ['vue-plausible'],
  plausible: {
    domain: 'vite.nuxtjs.org'
  },
  build: {
    ignore: ['_src']
  }
})
