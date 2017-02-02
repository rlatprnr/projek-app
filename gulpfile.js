var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var clean = require('gulp-clean');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var sh = require('shelljs');
var es = require('event-stream');

var dotenv = require('dotenv');
var env = process.env.NODE_ENV;

var envPath = '.env';

if (env === 'production') {
  envPath += '.production';
}

dotenv.config({path: envPath});

function configENV (from, toPath, toFilename) {
  return gulp.src(from)
    .pipe(replace(/\$ENV_([_jA-Z]*)/g, function (value) {
      var lookup = value.split("$ENV_")[1];
      return '\"'+process.env[lookup]+'\"';
    }))
    .pipe(rename(toFilename))
    .pipe(gulp.dest(toPath));
}

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', [
  'config-www',
  'sass',
  'android-notification-icons'
]);

gulp.task('android-notification-icons', function () {
  return es.merge(gulp.src('./resources/android/notifications/**/*'),
                  gulp.src('./platforms/android/res/**/*'))
    .pipe(gulp.dest('./platforms/android/res/'));
});

gulp.task('clean-config-www', function () {
  return gulp.src('./www/js/config.js')
    .pipe(clean());
});

gulp.task('config-www', ['clean-config-www'], function () {
  return configENV(
    './www/js/config.template.js',
    './www/js',
    'config.js'
  );
});

gulp.task('sass', function () {
  return gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('./www/css/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
