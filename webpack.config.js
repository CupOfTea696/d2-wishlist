const path = require('path')
const glob = require('glob-all')
const merge = require('webpack-merge')
const Dotenv = require('dotenv-webpack')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
// const PurgecssPlugin = require('purgecss-webpack-plugin')
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const AssetToHtmlPlugin = require('./webpack/AssetToHtmlPlugin')
// const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries')

// const { defaultOptions: purgecssOptions } = require('purgecss')

Array.prototype.unique = function () { return [...new Set(this)] }

const PATHS = {
  client: {
    src: path.resolve(__dirname, 'src/client'),
    dist: path.resolve(__dirname, 'dist/public'),
  },
  server: {
    src: path.resolve(__dirname, 'src/server'),
    dist: path.resolve(__dirname, 'dist'),
  },
}

const babelPlugins = [
  // '@babel/plugin-proposal-private-methods',
  // '@babel/plugin-proposal-class-properties',
]

const clientConfig = {
  name: 'Client',
  context: PATHS.client.src,
  entry: {
    'js/app': './js/index.js',
  },
  resolve: {
    extensions: [".js", ".vue"],
    alias: {
      'vue$': process.env.NODE_ENV === 'production' ? 'vue/dist/vue.runtime.min.js' : 'vue/dist/vue.runtime.js',
    }
  },
  output: {
    path: PATHS.client.dist,
  },
  target: 'web',
  plugins: [
    //new FixStyleOnlyEntriesPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    // new PurgecssPlugin({
    //   paths: glob.sync([
    //     `${PATHS.client.src}/**/*.html`,
    //     `${PATHS.client.src}/**/*.vue`,
    //   ]),
    //   variables: true,
    //   keyframes: true,
    //   defaultExtractor: content => {
    //     let attrs = Array.from(
    //       content.matchAll(/<[A-Za-z0-9_-]+\s+([^>]+)>/g),
    //       m => Array.from(
    //         m[1].matchAll(/(?<=^|\s):?[A-Za-z0-9]+="[^"]+"/g),
    //         m => {
    //           const [name, value] = m[0].split('=')
    //
    //           return {
    //             name: name.replace(/^:/, ''),
    //             value: name.match(/^:/) ? '' : value.replace(/"/g, ''),
    //           }
    //         }
    //       )
    //     ).flat()
    //
    //     return {
    //       attributes: {
    //         names: attrs.map(attr => attr.name).unique(),
    //         values: attrs.map(attr => attr.value.split(' ')).flat().unique().filter(a => a),
    //       },
    //       classes: Array.from(
    //         content.matchAll(/class="([A-Za-z0-9._ -]+)"/g),
    //         m => m[1].split(' ')
    //       ).flat().unique(),
    //       ids: Array.from(
    //         content.matchAll(/id="([A-Za-z0-9._ -]+)"/g),
    //         m => m[1].split(' ')
    //       ).flat().unique(),
    //       tags: Array.from(
    //         content.matchAll(/<([A-Za-z0-9_-]+)/g),
    //         m => m[1].split(' ')
    //       ).flat().unique().filter(tag => !['head', 'title', 'script'].includes(tag)),
    //       undetermined: [],
    //     }
    //   },
    // }),
    new HtmlWebpackPlugin({
      template: './index.ejs',
      inject: false,
    }),
    new VueLoaderPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              whitespace: 'condense',
            },
          },
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: '> 0.25%, not dead',
                },
              ],
            ],
            plugins: babelPlugins,
          }
        },
      },
      {
        test: /\.(s*)css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('autoprefixer'),
              ],
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
}

const serverConfig = {
  name: 'Server',
  context: PATHS.server.src,
  entry: {
    index: [
      './index.js',
    ],
  },
  target: 'node',
  output: {
    path: PATHS.server.dist,
  },
  plugins: [
    new Dotenv({
      safe: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: 'last 2 Chrome versions',
                  },
                },
              ],
            ],
            plugins: babelPlugins,
          },
        },
      },
    ],
  },
}

const mode = {
  mode: process.env.NODE_ENV,
}

module.exports = [
  merge(mode, clientConfig),
  merge(mode, serverConfig),
]
