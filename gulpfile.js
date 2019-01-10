var os = require('os');
var exec = require('child_process').exec;
var nodemon = require('gulp-nodemon');
var gulp = require('gulp');
var opn = require('opn');
var webpack = require('webpack-stream');

var screenWebpackConfig = require('./webpack-screen.config.js');
var remoteWebpackConfig = require('./webpack-remote.config.js');
var serverWebpackConfig = require('./webpack-server.config.js');

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
// files to watch for in the remote
const REMOTE_CHANGE_WATCH = [
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
// files to watch for in the server (which include the webapp)
const SERVER_CHANGE_WATCH = [
  ...SCREEN_CHANGE_WATCH,
  './server/*.js',
  './server/**/*.js',
];

// compile screen
gulp.task('compile-screen', function(done) {
  return gulp.src('./screen/src/app.js')
    .pipe(webpack(screenWebpackConfig))
    .pipe(gulp.dest('build'));
});

// compile remote
gulp.task('compile-remote', function(done) {
  return gulp.src('./remote/remote.js')
    .pipe(webpack(remoteWebpackConfig))
    .pipe(gulp.dest('build'));
});

// build configuration is different for the web and server
gulp.task('compile-server', function() {
  return gulp.src('./server/server.js')
    .pipe(webpack(serverWebpackConfig))
    .pipe(gulp.dest('build'));
});

// watch for changes for the screen
gulp.task('screen:watch', function() {
  gulp.watch(SCREEN_CHANGE_WATCH, gulp.series('compile-screen'));
});

// watch for changes for the remote
gulp.task('remote:watch', function() {
  gulp.watch(REMOTE_CHANGE_WATCH, gulp.series('compile-remote'));
});

// run webapp page
gulp.task("run-screen-local", function() {
  return opn('./build/screen-index.html', {app: browser});
});

// run webapp page
gulp.task("run-remote-local", function() {
  return opn('./build/remote-index.html', {app: browser});
});

// watch for changes for the server
gulp.task('server:watch', function() {
  gulp.watch(SERVER_CHANGE_WATCH, gulp.series('compile-server'));
});

// nodemon start server
gulp.task('run-nodemon-server', function() {
  var stream = nodemon({
    script: './build/server.js',
    ignore: ['node_modules/', 'bundles/'],
    watch: SERVER_CHANGE_WATCH,
    tasks: ['compile-screen', 'compile-remote', 'compile-server']
  });

  if (isDevEnv) {
    opn('http://localhost:666', {app: browser});
  }

  return stream;
})

gulp.task('run-production-server', function(cb) {
  exec('node build/server.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})


// default
gulp.task('dev-screen', gulp.series('compile-screen', 'screen:watch', 'run-screen-local'));
gulp.task('dev-remote', gulp.series('compile-remote', 'remote:watch', 'run-remote-local'));
gulp.task('dev-server', gulp.series('compile-server', 'run-nodemon-server'));
gulp.task('development', gulp.series('compile-screen','compile-remote', 'compile-server', 'run-nodemon-server'));
gulp.task('production', gulp.series('compile-screen','compile-remote', 'compile-server', 'run-production-server'));
/**
 * different 'default' task depending on settings
 */
function getDefaultTask() {
  // only testing the screen
  if (process.env.DEV_ENV === 'screen') {
    return gulp.series('dev-webapp');
  }

  // only testing the remote
  if (process.env.DEV_ENV === 'remote') {
    return gulp.series('dev-webapp');
  }

  // test with the socket server
  if (process.env.DEV_ENV === 'server') {
    return gulp.series('dev-server');
  }

  // production
  if (process.env.NODE_ENV === 'production') {
    return gulp.series('production');
  };

  // use dev otherwise
  return gulp.series('development');
};

gulp.task('default', getDefaultTask());
