const webpack = require('webpack');
const { override, addWebpackPlugin, addWebpackAlias } = require('customize-cra');

module.exports = override(
    addWebpackPlugin(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        })
    ),
    addWebpackAlias({
        process: require.resolve('process/browser.js'),
        buffer: require.resolve('buffer/index.js'),
    }),
    (config) => {
        const fallback = config.resolve.fallback || {};
        Object.assign(fallback, {
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "util": require.resolve("util/"),
            "zlib": require.resolve("browserify-zlib"),
            "stream": require.resolve("stream-browserify"),
            "url": require.resolve("url/"),
            "assert": require.resolve("assert/"),
            // Explicitly set process and buffer to false as they are handled by alias
            "process": false,
            "buffer": false,
        });
        config.resolve.fallback = fallback;

        // Ensure .js and .mjs are in the extensions list for resolution
        if (!config.resolve.extensions.includes('.js')) {
            config.resolve.extensions.push('.js');
        }
        if (!config.resolve.extensions.includes('.mjs')) {
            config.resolve.extensions.push('.mjs');
        }

        return config;
    }
); 