module.exports = {
  entry: './src/index.js',
  output: {
    path: './dist',
    filename: 'index.js'
  },
  module: {
    loaders: [{test: /\.json$/, loader: 'json' }]
  }
}
