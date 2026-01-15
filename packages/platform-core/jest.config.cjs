/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",

  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],

  extensionsToTreatAsEsm: [".ts"],

  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "tsconfig.json",
    },
  },

  moduleFileExtensions: ["ts", "js"],

  /**
   * 🔥 CRITICAL: force tests to import SOURCE, not dist
   */
  moduleNameMapper: {
    "^@predict-guru/platform-core$":
      "<rootDir>/src/index.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],
};
