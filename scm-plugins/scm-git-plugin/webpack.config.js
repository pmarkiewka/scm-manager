const path = require("path");

module.exports = {
  entry: {
    "scm-git-plugin": "./src/main/js/index.js"
  },
  devtool: "source-map",
  target: "web",
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty"
  },
  externals: [
    "react",
    "react-dom",
    "react-i18next",
    "styled-components",
    "@scm-manager/ui-types",
    "@scm-manager/ui-extensions",
    "@scm-manager/ui-components"
  ],
  module: {
    rules: [
      {
        parser: {
          system: false,
          systemjs: false
        }
      },
      {
        test: /\.(js|jsx)$/,
        // exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-flow"
            ],
            plugins: ["@babel/plugin-proposal-class-properties"]
          }
        }
      },
      {
        test: /\.(css|scss|sass)$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader"
        ]
      },
      {
        test: /\.(png|svg|jpg|gif|woff2?|eot|ttf)$/,
        use: ["file-loader"]
      }
    ]
  },
  output: {
    path: path.join(__dirname, "target", "scm-git-plugin-2.0.0-SNAPSHOT", "webapp", "assets"),
    filename: "[name].bundle.js",
    library: "scm-git-plugin",
    libraryTarget: "amd"
  }
};
