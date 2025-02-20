// eslint.config.js
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactNative from "eslint-plugin-react-native";

export default [
  js.configs.recommended,
  react.configs.recommended,
  reactNative.configs.all,
  {
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed for React 17+
      "react-native/no-inline-styles": "warn",
      "no-unused-vars": "warn",
    },
  },
];
