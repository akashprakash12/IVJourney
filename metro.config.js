const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  assetExts: [
    ...config.resolver.assetExts.filter((ext) => ext !== "svg"), // Remove svg from assets
    "glb",
    "gltf",
    "png",
    "jpg",
    "bin",
    "jpeg",
    "hdr",
    "exr",
  ],
  sourceExts: [
    ...config.resolver.sourceExts,
    "svg",
    "js",
    "jsx",
    "json",
    "ts",
    "tsx",
    "cjs",
    "mjs",
  ],
};

module.exports = withNativeWind(config, { input: "./global.css" });
