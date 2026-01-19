module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:security/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-native',
    'security'
  ],
  env: {
    "react-native/react-native": true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    "react-native/no-raw-text": "off", // Common false positive in some setups
    "security/detect-object-injection": "off" // Often too noisy for typical React Native state/props usage
  }
};
