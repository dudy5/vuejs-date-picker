var vue = require('vue-loader')
var path = require('path')

module.exports = {
  resolve: {
    root: `${__dirname}/src`
  },
  entry: {
    app: './src/main.js'
  },
  output: {
    path: path.resolve(__dirname, "src"),
    publicPath: '/src/',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel', exclude: /\/node_modules\/|no-babel\.js$/ },
      { test: /\.vue$/, loader: 'vue' }
    ]
  },
  sassLoader: {
    includePaths: [`${__dirname}/src`]
  },
  babel: {
    presets: ['es2015'],
    plugins: ['transform-runtime']
  },
  vue: {
    loaders: {
      css: 'vue-style!css',
      sass: 'vue-style!css!sass'
    },
  },
}