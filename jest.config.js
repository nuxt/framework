module.exports = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '\\.[jt]sx?$': './scripts/jest-transform.mjs'
  },
  testPathIgnorePatterns: [
    '.output/.*'
  ],
  globals: {
    'ts-jest': {
      useESM: true,
      isolatedModules: true
    }
  }
}
