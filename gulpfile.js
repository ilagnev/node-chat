const gulp = require('gulp');
const spawn = require('child_process').spawn;
let node;

gulp.task('copy-socket', () => {
	gulp.src('node_modules/socket.io-client/dist/socket.io.js*')
		.pipe(gulp.dest('./public/'));	
});

gulp.task('server', () => {

	gulp.watch(['./server.js', './lib/**/*.js'], function() {
		if (node) node.kill()
			node = spawn('node', ['server.js'], {stdio: 'inherit'})
		
		node.on('close', function (code) {
			if (code === 8) {
				gulp.log('Error detected, waiting for changes...');
			}
		});
	})

	// clean up if an error goes unhandled.
	process.on('exit', function() {
		if (node) node.kill()
	});
	node = spawn('node', ['server.js'], {stdio: 'inherit'})
});

gulp.task('default', ['copy-socket']);

