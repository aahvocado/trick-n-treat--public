var os = require('os');
var exec = require('child_process').exec;
var nodemon = require('gulp-nodemon');
var gulp = require('gulp');
var opn = require('opn');
var webpack = require('webpack-stream');

var screenWebpackConfig = require('./webpack-screen.config.js');

const isDevEnv = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production'; // todo: not 'production' is kinda hacky
var browser = os.platform() === 'darwin' ? '/Applications/Google\ Chrome.app' : 'google-chrome';
switch(os.platform())
{
  case 'aix':

    break;
  case 'darwin':
    browser = '/Applications/Google\ Chrome.app';
    break;
  case 'freebsd':

    break;
  case 'linux':

    break;
  case 'openbsd':

    break;
  case 'sunos':

    break;
  case 'win32':
    browser = "Chrome";
    break;
  default:
    browser = 'google-chrome';
    break;
}
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
  './shared/*.js',
  './shared/**/*.js',
];

// compile screen
gulp.task('compile-screen', function(done) {
  return gulp.src('./src/app.js')
    .pipe(webpack(screenWebpackConfig))
    .pipe(gulp.dest('build'));
});

// watch for changes for the screen
gulp.task('screen:watch', function() {
  gulp.watch(SCREEN_CHANGE_WATCH, gulp.series('compile-screen'));
});

// run webapp page
gulp.task("run-screen-local", function() {
  return opn('./build/screen-index.html', {app: browser});
});

// default
gulp.task('dev-screen', gulp.series('compile-screen', 'screen:watch', 'run-screen-local'));
gulp.task('development', gulp.series('compile-screen'));
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
