const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => ({
  mode: argv.mode,
  entry: './src/index.js',
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].[hash].js',
  },
  devServer: {
    contentBase: 'dist',
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    new CopyPlugin([
      {
        from: 'public',
        to: '',
        ignore: [
          {
            glob: 'index.html',
            matchBase: false,
          },
        ],
      },
      { from: 'data', to: 'data' },
    ]),
  ],
});
