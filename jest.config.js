module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '\\.[jt]sx?$': 'ts-jest'
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
