import { withDocus } from 'docus'

export default withDocus({
  rootDir: __dirname,
  buildModules: [require.resolve('./modules/schema.ts')],
  watch: [require.resolve('./modules/schema.ts')]
})
