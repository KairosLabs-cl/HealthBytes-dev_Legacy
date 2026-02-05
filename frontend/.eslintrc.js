module.exports = {
  root: true,
  extends: [
    'expo',
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
    // Console warnings (permitir console.warn y console.error)
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // React
    "react/prop-types": "off", // Usamos TypeScript
    "react/react-in-jsx-scope": "off", // No necesario en React 18

    // React Native
    "react-native/no-raw-text": "off",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "off", // Usamos Tailwind
    "react-native/sort-styles": "off",

    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error', // Prohibir 'any'
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // Security
    "security/detect-object-injection": "off" // Muchos falsos positivos
  }
};
