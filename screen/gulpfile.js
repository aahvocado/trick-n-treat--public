const os = require('os');
const gulp = require('gulp');
const open = require('gulp-open');
const webpack = require('webpack-stream');
const screenWebpackConfig = require('./webpack.config.js');

const isDevEnv = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production'; // todo: not 'production' is kinda hacky
const browser = (function() {
  switch (os.platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'sunos':
      return null;
    case 'darwin':
      return '/Applications/Google\ Chrome.app';
    case 'win32':
      return "Chrome";
    default:
      return 'google-chrome';
  }
})();
// files to watch for in the screen
const SCREEN_CHANGE_WATCH = [
  '!**/{' + [
    'bower_components',
    'bundles',
    'compiled',
    'config',
    'dev',
    'libraries',
    'node_modules',
  ].join(',') +
  '}/**',
  './public/index.html',
  '*.css',
  './public/*.js',
  './public/**/*.js',
  './src/*.js',
  './src/**/*.js',
];

// compile screen
gulp.task('compile-screen', function(done) {
  return gulp.src('./src/index.js')
    .pipe(webpack(screenWebpackConfig))
    .pipe(gulp.dest('build'));
});

// watch for changes for the screen
gulp.task('screen:watch', function() {
  gulp.watch(SCREEN_CHANGE_WATCH, gulp.series('compile-screen'));
});

// run webapp page
gulp.task("run-screen-local", function() {
  return gulp.src('./build/index.html')
    .pipe(open({ app: browser }))
});

// default
gulp.task('development', gulp.series('compile-screen', 'run-screen-local', 'screen:watch'));
gulp.task('production', gulp.series('compile-screen'));
/**
 * different 'default' task depending on settings
 */
function getDefaultTask() {
  // production
  if (process.env.NODE_ENV === 'production') {
    return gulp.series('production');
  };

  // use dev otherwise
  return gulp.series('development');
};

gulp.task('default', getDefaultTask());
