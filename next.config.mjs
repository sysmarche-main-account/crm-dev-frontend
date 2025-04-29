import path from "path";
import createNextIntlPlugin from "next-intl/plugin";
import withPWA from "next-pwa";
import { execSync } from "child_process";
import webpack from "webpack";

const withNextIntl = createNextIntlPlugin();

const isDev = process.env.NODE_ENV === "development";
const isServer = typeof window === "undefined";
if (isServer && isDev) {
  execSync("node ./src/generateJson.js");
}

/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  output: "standalone",
  productionBrowserSourceMaps: false,
  modularizeImports: {
    "@mui/material": {
      transform: "@mui/material/{{member}}",
    },
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
  },
  sassOptions: {
    includePaths: [path.join(process.cwd(), "styles")],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      execSync("node ./src/generateJson.js"); // This will run your script during the build
    }

    // Add jQuery
    config.plugins.push(
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
      })
    );
    // config.plugins.push(
    //   new config.webpack.ProvidePlugin({
    //     $: "jquery",
    //     jQuery: "jquery",
    //     "window.jQuery": "jquery",
    //   })
    // );

    // Ensure CSS is handled correctly
    // config.module.rules.push({
    //   test: /\.css$/,
    //   use: ["style-loader", "css-loader"],
    // });

    // Modify existing SVG rule if it exists
    // config.module.rules.forEach((rule) => {
    //   if (rule.test && rule.test.toString().includes("svg")) {
    //     rule.exclude = /\.svg$/;
    //   }
    // });

    // Add a new rule for handling SVGs with @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
      include: path.resolve("public"), // Adjust if SVGs are in a different directory
    });

    return config;
  },
  // pwa: {
  //   dest: "public",
  //   register: true,
  //   skipWaiting: true,
  // },
};

// export default nextConfig;

// export default withPWA(withNextIntl(nextConfig));
const finalConfig = withPWA({ dest: "public" })(withNextIntl(nextConfig));
export default finalConfig;
