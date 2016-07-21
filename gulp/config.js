var dest = './build',
src = './src',
mui = './node_modules/material-ui/src',
app = src + '/app/',
helpers = src + '/helpers/';

module.exports = {
  browserSync: {
    server: {
      // We're serving the src folder as well
      // for sass sourcemap linking
      baseDir: [dest, src]
    },
    files: [
      dest + '/**'
    ]
  },
  markup: {
    src: src + "/www/**",
    dest: dest
  },
  browserify: {
    // Enable source maps
    debug: true,
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/app/app.js',
      dest: dest,
      outputName: 'app.js'
    }],
    extensions: ['.js'],
  },
  scripts: {
    glob: helpers + '**/*.js',
    src: [
      helpers + 'globals.js',
      '../node_modules/hashids/dist/hashids.min.js',
      src + '/manifest.json',
      app + 'font.js',
      helpers + 'background.js',
      helpers + 'storageHandler.js'
    ],
    dest: dest
  },
  babel: {
    src: [
      helpers + 'background.js',
      helpers + 'storageHandler.js'
    ],
    dest: dest
  }
};