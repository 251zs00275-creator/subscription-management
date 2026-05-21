const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'components/Forms/**/*.{ts,tsx}',
    'components/Common/**/*.{ts,tsx}',
    '!lib/db.ts',
    '!hooks/use-toast.ts',
    '!components/Forms/ReceiptUpload.tsx',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
}

module.exports = createJestConfig(customJestConfig)
