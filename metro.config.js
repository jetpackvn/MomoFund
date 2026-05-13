const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push("js", "json", "ts", "tsx", "cjs");

// Đảm bảo Metro resolve đúng platform-specific files (.web.ts, .native.ts, v.v.)
defaultConfig.resolver.platforms = ['web', 'ios', 'android', 'native'];

module.exports = defaultConfig;

