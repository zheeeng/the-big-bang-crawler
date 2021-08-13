const { createFarrowConfig } = require('farrow')

module.exports = createFarrowConfig({
  server: {
    src: './src',
    dist: './dist',
  }
})
