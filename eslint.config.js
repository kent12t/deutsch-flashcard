import js from "@eslint/js";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  { ignores: ["dist/**", "build/**"] },
  js.configs.recommended,
  react.configs.flat.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: "detect" } },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "react/prop-types": "off", // React 19 ignores propTypes; no prop-types dependency
    },
  },
];
