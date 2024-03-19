import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from 'url';

const dev = process.env.NODE_ENV !== "production";
//If in dev mode load hmr plugins
const hmrPlugins = dev ? ["webpack-hot-middleware/client"] : [];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  mode: process.env.NODE_ENV,
  devtool: dev ? "inline-source-map" : undefined,
  entry: [...hmrPlugins, path.join(__dirname, "src", "index.js")],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    clean: true,
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.js|\.jsx$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, "src"),
        use: "babel-loader",
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        use: {
          loader: "url-loader",
          options: {
            limit: 8192,
            name: "static/media/[name].[contenthash].[ext]",
          },
        },
      },
      {
        test: /\.svg/,
        use: "@svgr/webpack",
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "index.html"),
    }),
    new webpack.ProvidePlugin({
      React: "react",
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  devServer: {
    hot: true,
  },
}

export default config;
