/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, ctx) => {
    // Modify the `config` here
    // const { isServer, dev } = ctx;
    // config.output.webassemblyModuleFilename =
    //   isServer && !dev ? "../static/wasm/[modulehash].wasm" : "static/wasm/[modulehash].wasm";

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };
    return config;
  },
};

export default nextConfig;
