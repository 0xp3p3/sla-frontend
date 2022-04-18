/* eslint-disable @typescript-eslint/no-var-requires */
// const withTM = require('next-transpile-modules')(['@blocto/sdk', '@project-serum/sol-wallet-adapter']);
const withTM = require('next-transpile-modules')(['@blocto/sdk']);

/** @type {import('next').NextConfig} */
module.exports = withTM({
    reactStrictMode: true,
    webpack5: true,
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback.fs = false;
      }
      return config;
    },
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: true,
    },
    compiler: {
      // ssr and displayName are configured by default
      styledComponents: true,
    },
});
