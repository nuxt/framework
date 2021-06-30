module.exports = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '\\.[jt]sx?$': './scripts/jest-transform.mjs'
  },
  testPathIgnorePatterns: [
    '.output/.*'
  ]
}
