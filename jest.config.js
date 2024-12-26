export default {
  testEnvironment: "node",
  transform: {},
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  testMatch: ["**/__tests__/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  verbose: true,
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  testTimeout: 10000,
};
