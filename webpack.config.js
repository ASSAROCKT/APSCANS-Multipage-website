const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    home: './src/index.js',
    series: './src/series.js',
    reader: './src/reader.js',
    about: './src/about.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      // Uncomment this if you import CSS in JS
      // {
      //   test: /\.css$/,
      //   use: ['style-loader', 'css-loader'],
      // },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      chunks: ['home'],
    }),
    new HtmlWebpackPlugin({
      template: './public/series.html',
      filename: 'series.html',
      chunks: ['series'],
    }),
    new HtmlWebpackPlugin({
      template: './public/reader.html',
      filename: 'reader.html',
      chunks: ['reader'],
    }),
    new HtmlWebpackPlugin({
      template: './public/about.html',
      filename: 'about.html',
      chunks: ['about'],
    }),
    new CopyPlugin({
      patterns: [
        // Copy CSS from src if not bundled
        { from: 'src/App.css', to: 'App.css', noErrorOnMissing: true },
        // Copy everything else in public (except HTML)
        {
          from: path.resolve(__dirname, 'public'),
          to: path.resolve(__dirname, 'dist'),
          globOptions: {
            dot: true,
            ignore: [
              '**/index.html',
              '**/series.html',
              '**/reader.html',
              '**/about.html',
            ],
          },
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
};
