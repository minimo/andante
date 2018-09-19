/*
* gulpfile.js
*/

const BUILD_FILENAME = 'phina_app.js'

const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['build']);

gulp.task('build', function() {
  gulp.src(['./src/**/*.js'])
    .pipe(sourcemaps.init())  // ソースマップを初期化
    .pipe(concat(BUILD_FILENAME))
    // .pipe(uglify())
    .pipe(sourcemaps.write()) // ソースマップの作成
    .pipe(gulp.dest('./build'));
});

gulp.task("watch", function() {  
  var targets = [
    './src/**/*.js',
  ];
  gulp.watch(targets, ['build']);
});
