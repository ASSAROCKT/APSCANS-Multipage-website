const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production', // Use 'production' for builds, 'development' for dev server
  entry: {
    home: './src/index.js',
    series: './src/series.js',
    reader: './src/reader.js',
    about: './src/about.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Clean the output directory before each build.
    publicPath: '/', // <--- THIS LINE IS CRITICAL
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
      // If you were importing CSS directly into your JS entry files:
      // {
      //   test: /\.css$/,
      //   use: ['style-loader', 'css-loader', 'postcss-loader'],
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
        { from: 'src/App.css', to: 'App.css' },
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
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: {
      rewrites: [
        // 1. Exact path for the root (homepage)
        { from: /^\/$/, to: '/index.html' },

        // 2. Exact path for the about page
        { from: /^\/about$/, to: '/about.html' },

        // 3. More specific parameterized path (reader page: /slug/chapter)
        {
          from: /^\/([^/]+)\/([^/]+)$/, // Matches /some-slug/some-chapter
          to: function(context) {
            const slug = context.match[1];
            const chapter = context.match.input.split('/')[2]; // Extract chapter from input URL directly
            return `/reader.html?mangaTitle=${slug}&chapterKey=${chapter}`;
          },
        },

        // 4. General parameterized path (series page: /slug)
        {
          from: /^\/([^/]+)$/, // Matches /some-slug
          to: function(context) {
            const slug = context.match[1];
            return `/series.html?mangaTitle=${slug}`;
          },
        },

        // 5. General fallback for any other path not matched by a specific file or rule above
        { from: /./, to: '/index.html' },
      ],
    },
  },
};
