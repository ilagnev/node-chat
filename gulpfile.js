const gulp = require('gulp');

gulp.task('copy-socket', () => {
	gulp.src('node_modules/socket.io-client/dist/socket.io.js*')
		.pipe(gulp.dest('./public/'));	
});

gulp.task('default', ['copy-socket']);
