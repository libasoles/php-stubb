var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var es = require('event-stream');
var ngConstant = require('gulp-ng-constant');
var argv = require('yargs').argv;
var jshint = require('gulp-jshint');
var enviroment = argv.env || 'dev';

gulp.task('config', function () {
  var config = gulp.src('config/' + enviroment + '.json')
    .pipe(ngConstant(
    {
        name: 'app.config',
        space: '\t',
        wrap: false
    }));  
  return config
    .pipe(concat('app-config.js'))
    .pipe(gulp.dest('.'))
    .on('error', function() { });
});

gulp.task('js', ['config'], function () {
  gulp.src(['app-config.js', 'src/**/module.js', 'src/**/*.js'])
    .pipe(sourcemaps.init())
      .pipe(concat('app.js'))
      .pipe(ngAnnotate())
      //.pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'))
})

gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});

gulp.task('watch', ['lint','js'], function () {
  gulp.watch('src/**/*.js', ['js'])
})