const compose = (...fns) =>
  fns.reduceRight((memo, fn) => input => fn(memo(input)), input => input);

module.exports = () => {
  const withCss = require("@zeit/next-css");
  const withLess = require("@zeit/next-less");
  const lessToJS = require("less-vars-to-js");
  const fs = require("fs");
  const path = require("path");
  // Where your antd-custom.less file lives
  const themeVariables = lessToJS(
    fs.readFileSync(
      path.resolve(__dirname, "../assets/antd-custom.less"),
      "utf8"
    )
  );
  // fix: prevents error when .less files are required by node
  if (typeof require !== "undefined") {
    require.extensions[".less"] = () => {};
  }
  return compose(
    withCss,
    withLess
  )({
    distDir: "../../.next",
    exportTrailingSlash: true,
    lessLoaderOptions: {
      javascriptEnabled: true,
      modifyVars: themeVariables, // make your antd custom effective
    },
    webpack(config, { webpack, dev, dir }) {
      if (dev) config.devtool = "cheap-module-source-map";

      const graphqlRule = {
        test: /\.(graphql|gql)$/,
        include: [dir],
        exclude: /node_modules/,
        use: [
          {
            loader: "graphql-tag/loader",
          },
        ],
      };
      return {
        ...config,
        module: {
          ...config.module,
          rules: [...config.module.rules, graphqlRule],
        },
        plugins: [
          ...config.plugins,
          new webpack.DefinePlugin({
            "process.env.ROOT_DOMAIN": JSON.stringify(process.env.ROOT_DOMAIN),
            "process.env.ROOT_URL": JSON.stringify(process.env.ROOT_URL),
          }),
        ],
      };
    },
  });
};
