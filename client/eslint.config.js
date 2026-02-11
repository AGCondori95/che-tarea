import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  // Ignorar archivos y directorios
  {
    ignores: [
      "dist",
      "dist-ssr",
      "node_modules",
      "*.local",
      "coverage",
      ".vite",
      "build",
    ],
  },

  // Configuración base para archivos JS/JSX
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Reglas recomendadas de ESLint
      ...js.configs.recommended.rules,

      // Reglas recomendadas de React Hooks
      ...reactHooks.configs.recommended.rules,

      // Reglas de React Refresh
      "react-refresh/only-export-components": [
        "warn",
        {allowConstantExport: true},
      ],

      // Variables no usadas (permitir componentes con mayúscula inicial)
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_|^React$",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // Mejores prácticas
      "no-console": ["warn", {allow: ["warn", "error"]}],
      "no-debugger": "warn",
      "prefer-const": "error",
      "no-var": "error",

      // Estilo de código
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      semi: ["error", "always"],
      quotes: ["error", "double", {avoidEscape: true}],

      // React específico
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
    },
  },

  // Configuración específica para archivos de configuración
  {
    files: ["*.config.{js,cjs,mjs}", "vite.config.js", "tailwind.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
    },
  },
];
