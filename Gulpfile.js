/*eslint no-undef:0*/

var gulp = require('gulp'),
    del = require('del'),
    templateCache = require('gulp-angular-templatecache'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    babel = require('gulp-babel');

gulp.task('clean', function () {
    return del([
        'simple_ui/static/scss/**/*.css',
        'simple_ui/static/js/refugeeApp/app.built.js',
        'simple_ui/static/js/refugeeApp/templates.js'
    ]);
});

gulp.task('scripts', ['clean', 'templates'], function () {
    return gulp.src('simple_ui/static/js/refugeeApp/**/*.js')
        .pipe(concat('app.built.js'))
        .pipe(gulp.dest('simple_ui/static/js/refugeeApp'));
});

gulp.task('templates', ['clean'], function () {
    return gulp.src('simple_ui/templates/angular/**/*.html')
        .pipe(templateCache({
            module: 'refugeeApp'
        }))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('simple_ui/static/js/refugeeApp'))
        ;
});


gulp.task('sass', ['clean'], function () {
    return gulp.src(['simple_ui/static/scss/main.scss', 'simple_ui/static/scss/content.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('simple_ui/static/scss/'));
});


gulp.task('refugeeApp', ['clean', 'scripts', 'templates', 'sass']);

gulp.task('default', ['refugeeApp']);