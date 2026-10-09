module.exports = [
  {
    files: ["**/*.js"],

    languageOptions: {
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        console: "readonly",
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        jest: "readonly",
        afterEach: "readonly",
      },
    },

    rules: {
      "no-undef": "error",
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
];