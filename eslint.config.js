import js from "@eslint/js";
import babelParser from "@babel/eslint-parser";
import react from "eslint-plugin-react";
import reactNative from "eslint-plugin-react-native";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        requireConfigFile: false,
      },
      globals: {
        "fetch": true,
        require: "readonly",
        module: "readonly",
        process: "readonly",
        exports: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        __dirname: "readonly",
      },
    },
    plugins: {
      react,
      "react-native": reactNative,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react-native/no-inline-styles": "warn",
      "no-unused-vars": "warn",
      "no-irregular-whitespace": "error"
    },
  },
];
