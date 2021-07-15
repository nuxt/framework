export default {
  alias: {
    '@apollo/client/core': require.resolve('@apollo/client/core/index.js'),
    '@apollo/client': require.resolve('@apollo/client/index.js')
  },
  build: {
    transpile: [
      '@vue/apollo-composable',
      '@apollo/client',
      'tslib'
    ]
  }
}
