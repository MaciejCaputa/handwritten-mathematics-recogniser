const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const tsProject = ts.createProject('tsconfig.json', { declaration: true });
const webserver = require('gulp-webserver');

gulp.task('scripts', () => {
  return tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy:npm', () => {
  return gulp
    .src(['package.json', '.npmignore', 'README.md'])
    .pipe(gulp.dest('dist'));
});

gulp.task('copy:demo', () => {
  return gulp
    .src(['src/demo/index.html', 'src/demo/style.css', 'src/demo/common.js'])
    .pipe(gulp.dest('dist/demo'));
});

gulp.task('watch', ['build'], function() {
  gulp.watch('src/**/*.ts', ['scripts']);
  gulp.watch(['package.json', '.npmignore'], ['copy:npm']);
  gulp.watch(['src/demo/index.html', 'src/demo/style.css'], ['copy:demo']);
});

gulp.task('build', ['scripts', 'copy:demo', 'copy:npm']);

gulp.task('serve', ['build'], function() {
  gulp.src('dist')
    .pipe(webserver({
      livereload: true,
      // directoryListing: true,
      open: 'http://localhost:8000/demo'
    }));
});

gulp.task('default', ['serve', 'watch', 'build']);

// Defaults to development mode.
gulp.task('default', ['serve']);
