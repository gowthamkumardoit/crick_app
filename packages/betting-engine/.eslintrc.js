// .eslintrc.js
module.exports = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: ["@predict-guru/platform-core/src/*"],
      },
    ],
  },
};
