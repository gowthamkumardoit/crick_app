/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",

  roots: ["<rootDir>/src"],

  extensionsToTreatAsEsm: [".ts"],

  testMatch: ["**/__tests__/**/*.test.ts"],

  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "tsconfig.json",
    },
  },

  moduleFileExtensions: ["ts", "js"],

  /**
   * 🔥 CRITICAL: force SOURCE imports (avoid dist/)
   */
  moduleNameMapper: {
    "^@predict-guru/platform-core$": "<rootDir>/../platform-core/src/index.ts",

    "^@predict-guru/betting-engine$": "<rootDir>/src/index.ts",

    // Fix NodeNext / ESM relative imports
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
