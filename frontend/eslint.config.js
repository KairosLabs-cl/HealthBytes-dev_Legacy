const js = require("@eslint/js");
const reactPlugin = require("eslint-plugin-react");
const securityPlugin = require("eslint-plugin-security");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      ".expo/**",
      "dist/**",
      "**/*.d.ts",
      "babel.config.js",
      "metro.config.js",
      "tailwind.config.js",
    ],
  },
  // TypeScript files are covered by `pnpm type-check` (tsc --noEmit)
  // ESLint only lints JS/JSX to avoid needing @typescript-eslint parser
  {
    files: ["**/*.js", "**/*.jsx"],
    ...js.configs.recommended,
    plugins: {
      react: reactPlugin,
      security: securityPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        __DEV__: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "no-console": "off",
      "no-unused-vars": "warn",
      "security/detect-object-injection": "off",
    },
  },
];
