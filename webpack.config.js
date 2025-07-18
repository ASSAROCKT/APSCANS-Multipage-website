const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development', // or 'production' for builds
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
    // Copy static assets like App.css and _redirects to the dist folder
    new CopyPlugin({
      patterns: [
        { from: 'src/App.css', to: 'App.css' }, // Ensure your global CSS is copied
        { from: 'public/_redirects', to: '_redirects' }, // Copy the redirects file
        // Add other static assets if needed, e.g., images
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    // --- START OF NEW/MODIFIED DEV SERVER CONFIG ---
    historyApiFallback: {
      // This is crucial for MPAs to handle clean URLs locally.
      // It tells the dev server how to map incoming "clean" paths
      // to your actual HTML files with query parameters.
      rewrites: [
        // Rule for series page: /manga-slug -> /series.html?mangaTitle=manga-slug
        // The `from` regex captures the slug.
        // The `to` function constructs the internal path with query params.
        {
          from: /^\/([^/]+)$/, // Matches /some-slug (captures 'some-slug')
          to: function(context) {
            const slug = context.match[1];
            return `/series.html?mangaTitle=${slug}`;
          },
        },
        // Rule for reader page: /manga-slug/chapter-key -> /reader.html?mangaTitle=manga-slug&chapterKey=chapter-key
        {
          from: /^\/([^/]+)\/([^/]+)$/, // Matches /some-slug/some-chapter (captures both)
          to: function(context) {
            const slug = context.match[1];
            const chapter = context.match[2];
            return `/reader.html?mangaTitle=${slug}&chapterKey=${chapter}`;
          },
        },
        // Rule for the About page (if you want /about instead of /about.html)
        {
            from: /^\/about$/,
            to: '/about.html',
        },
        // Fallback for root (home page) if needed, though direct / usually works
        { from: /^\/$/, to: '/index.html' },
      ],
      // If none of the rewrites match and the file doesn't exist, it falls back to index.html
      // This is common for SPAs, but for MPAs, you might want a 404 for truly missing paths.
      // For now, let's keep it simple.
    },
    // --- END OF NEW/MODIFIED DEV SERVER CONFIG ---
  },
};