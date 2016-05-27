const gulp = require('gulp'),
	runSequence = require('run-sequence'),
	$ = require('gulp-load-plugins')({
		scope: ['devDependencies']
	});

function _error(taskName) {
	return err => {
		$.util.log($.util.colors.red("ERROR\n", taskName));
		$.util.log(err);
	}
}

gulp.task('style-lint', () => gulp.src('app/styles-less/**/*')
	.pipe($.lesshint({configPath: './configurations/.lesshintrc'}))
	.pipe($.lesshint.reporter()));

gulp.task('styles', () => gulp.src('src/styles-less/react-tags.less')
	.pipe($.less({compress: true}).on('ERROR\n', _error('STYLES')))
	.pipe($.cleanCss({
		compatibility: '*',
		keepSpecialComments: 0
	}))
	.pipe(gulp.dest('bin'))
);

gulp.task('scripts', () => gulp.src('src/script-babel/main.jsx')
	.pipe($.include())
	.pipe($.eslint())
	.pipe($.eslint.format())
	.pipe($.if('*.jsx', $.babel())).on('error', _error('SCRIPTS'))
	.pipe($.concat('react-tags.js'))
	.pipe(gulp.dest('bin'))
);

gulp.task('js-min', () => gulp.src('bin/react-tags.js')
	.pipe($.uglify())
	.pipe($.rename({extname: '.min.js'}))
	.pipe(gulp.dest('bin'))
);

gulp.task('build', cb => {
	runSequence('scripts', 'js-min', cb);
});

gulp.task('default', cb => {
	runSequence('scripts', 'styles', cb);
	gulp.watch('src/**/*.jsx', ['scripts']);
	gulp.watch('example/**/*.jsx', ['scripts-example']);
	gulp.watch('src/**/*.less', ['style-lint', 'styles']);
});