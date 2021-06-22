module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '\\.[jt]sx?$': 'ts-jest'
  },
  testPathIgnorePatterns: [
    '.output/.*'
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
}
