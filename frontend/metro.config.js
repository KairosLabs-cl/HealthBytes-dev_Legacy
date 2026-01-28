const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Ensure import.meta and modern module extensions are handled
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// WORKAROUND: Prioritize CommonJS for web to avoid "import.meta" errors (e.g. from zustand v5)
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

// Allow require.context used by some dependencies
config.transformer = {
	...config.transformer,
	unstable_allowRequireContext: true,
};

module.exports = withNativeWind(config, { input: './global.css' });