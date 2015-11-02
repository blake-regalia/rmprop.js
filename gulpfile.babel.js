'use strict';

// gulp & gulp-specific plugins
import gulp from 'gulp';
import babel from 'gulp-babel';
import mocha from 'gulp-mocha';
import istanbul from 'gulp-istanbul';
import plumber from 'gulp-plumber';

// general libraries
import del from 'del';
import {Instrumenter} from 'isparta';

// local
// ...

// pre-test
gulp.task('pre-test', function () {
	return gulp.src('lib/**/*.js')
		.pipe(istanbul({
			includeUntested: true,
			instrumenter: Instrumenter
		}))
		.pipe(istanbul.hookRequire());
});


// test
gulp.task('test', ['pre-test'], () => {
	let mochaErr;
	gulp.src('test/**/*.js')
		.pipe(plumber())
		.pipe(mocha({reporter: 'spec'}))
		.on('error', (err) => {
			mochaErr = err;
		})
		.pipe(istanbul.writeReports())
		.on('end', () =>{
			cb(mochaErr);
		});
});

// clean
gulp.task('clean', () => {
	return del('dist');
});

// babel
gulp.task('babel', ['clean'], () => {
	return gulp.src('lib/**/*.js')
		.pipe(babel())
		.pipe(gulp.dest('dist'));
})

// prepublish
gulp.task('prepublish', ['babel']);

// default
gulp.task('default', ['test']);