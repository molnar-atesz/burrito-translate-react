module.exports = {
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testPathIgnorePatterns: [
    "**/__fixtures__/**/*.+(ts|tsx|js)",
    "/__utils__/**/*.+(ts|tsx|js)"
  ],
  setupFiles: [
    "**/__fixtures__/**/*.+(ts|tsx|js)"
  ],
  testEnvironment: "jsdom",
  verbose: true
};
