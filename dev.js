import webpack from 'webpack';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackDevMiddleware from 'webpack-dev-middleware';
import config from "./client/webpack.config.js";
config.mode = "development";

const compiler = webpack(config);

export const webpackDevMiddlewareComp = webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
});
export const webpackHotMiddlewareComp = webpackHotMiddleware(compiler);
