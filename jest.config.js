module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.spec.ts', '**/__tests__/**/*.ts'], // Adjust the pattern if needed
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    // If you want to ignore some folders, e.g. node_modules (default):
    transformIgnorePatterns: ['/node_modules/'],
  };
  