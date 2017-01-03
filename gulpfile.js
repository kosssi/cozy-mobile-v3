var gulp = require('gulp');
var gutil = require("gulp-util");
var shell = require('gulp-shell')
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var runSequence = require('run-sequence');
var path = require("path");
var preprocess = require('gulp-preprocess');
var packageJson = require('./package.json');
var clean = require('gulp-clean');
var myip = require('quick-local-ip');

const WEBPACK_NETWORK_IP = myip.getLocalIP4();
const WEBPACK_SERVER_HOST = 'http://' + WEBPACK_NETWORK_IP;
const WEBPACK_SERVER_PORT = 3000;
const PHONEGAP_SERVER_PORT = 3001;
const STATIC_PATH = 'static';
const BUNDLE_FILE = 'bundle.js';
const APP_NAME = packageJson.name;
const APP_ID = packageJson.id;
const APP_VERSION = packageJson.version;

var webpackOptionsLoader = {
  test: /.jsx?$/,
  loaders: ['babel?presets[]=react,presets[]=es2015,presets[]=stage-0'],
  include: path.join(__dirname, 'src'),
  exclude: /node_modules/
};
var webpackOptions = {
  module: {
    loaders: [
      webpackOptionsLoader,
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }
    ]
  },
  entry: [
    './src/index.jsx'
  ],
  output: {
    path: path.join(__dirname, './www/' + STATIC_PATH + '/'),
    filename: BUNDLE_FILE
  },
  eslint: {

  },
  debug: true,
  progress: false,
  emitError: true,
  emitWarning: true,
  failOnError: true,
  stats: {
    colors: true,
    reasons: true
  },
  devtool: 'source-map'
};

/**
 * copy non bundled files from src to dist directory
 */
gulp.task('copy-layout', function() {
  return gulp.src(['./src/index.html'])
    .pipe(preprocess({
      context: {
        BUNDLE_PATH: './' + STATIC_PATH + '/' + BUNDLE_FILE,
        APP_NAME: APP_NAME
      }
    }))
    .pipe(gulp.dest('./www'))
});

/**
 * copy non bundled files from src to dist directory with path to hot loader server
 */
gulp.task('copy-layout-hot', function() {
  return gulp.src(['./src/index.html'])
    .pipe(preprocess({
      context: {
        BUNDLE_PATH: WEBPACK_SERVER_HOST + ':' + WEBPACK_SERVER_PORT +'/' + STATIC_PATH + '/' + BUNDLE_FILE,
        APP_NAME: APP_NAME
      }
    }))
    .pipe(gulp.dest('./www'))
});

/**
 * Compile react jsx ES6 & ES7 to ES5 js
 */
gulp.task('compile-react', function(done) {
  webpack(webpackOptions, function(err, stats) {
    if(err) console.log(err);
    gutil.log("[webpack]", stats.toString({}));
    done();
  });
});

/**
 * Compile react jsx ES6 & ES7 to ES5 js and run webpack hot loader server
 */
gulp.task('compile-react-hot', function(done) {
  webpackOptions.entry = [
    'webpack-dev-server/client?' + WEBPACK_SERVER_HOST + ':' + WEBPACK_SERVER_PORT,
    'webpack/hot/only-dev-server'
  ].concat(webpackOptions.entry);
  webpackOptions.plugins = [
    new webpack.HotModuleReplacementPlugin({})
  ];
  webpackOptionsLoader.loaders.unshift('react-hot');
  webpackOptions.output.publicPath = WEBPACK_SERVER_HOST + ':' + WEBPACK_SERVER_PORT + '/' + STATIC_PATH + '/';

  new WebpackDevServer(webpack(webpackOptions), {
    hot: true,
    publicPath: '/' + STATIC_PATH + '/'
  }).listen(WEBPACK_SERVER_PORT, WEBPACK_NETWORK_IP, function(err) {
    if(err) console.log(err);
    done();
    console.log('webpack dev server listening at ' + WEBPACK_SERVER_HOST + ':' + WEBPACK_SERVER_PORT);
  });
});

/**
 * Clear previous html code from www
 */
gulp.task('clear-cordova-www', function () {
  return gulp.src('www', {read: false})
    .pipe(clean());
});

/**
 * Fill cordova project with proper html, js, css
 */
gulp.task('prepare-build', function(done) {
  runSequence('clear-cordova-www', 'copy-layout', 'compile-react', done);
});

/**
 * Emulate ios app with hot loader
 */
gulp.task('prebuild-hot', function(done) {
  runSequence('clear-cordova-www', 'copy-layout-hot', 'compile-react-hot', done);
});

/**
 * Emulate ios app with hot loader
 */
gulp.task('prebuild-ios-hot', function(done) {
  runSequence('clear-cordova-www', 'copy-layout-hot', 'compile-react-hot', 'emulate-ios', done);
});

/**
 * Emulate android app with hot loader
 */
gulp.task('prebuild-android-hot', function(done) {
  runSequence('clear-cordova-www', 'copy-layout-hot', 'compile-react-hot', 'emulate-android', done);
});

/**
 * Emulate browser app with hot loader
 */
gulp.task('prebuild-browser-hot', function(done) {
  runSequence('clear-cordova-www', 'copy-layout-hot', 'compile-react-hot', 'run-browser', done);
});

/**
 * Emulate app by ripple and hot loader
 */
gulp.task('prebuild-ripple-hot', function(done) {
  runSequence('clear-cordova-www', 'copy-layout-hot', 'compile-react-hot', 'emulate-ripple', done);
});

/**
 * Run test by 'The PhoneGap Developer App'
 */
gulp.task('prebuild-phonegap-hot', function(done) {
  runSequence('clear-cordova-www', 'copy-layout-hot', 'compile-react-hot', 'phonegap-serve', done);
});
