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
        require: "readonly",
        module: "readonly",
        process: "readonly",
        console: "readonly",
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
    },
  },
];
