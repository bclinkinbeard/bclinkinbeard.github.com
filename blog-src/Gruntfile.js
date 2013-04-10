module.exports = function( grunt ) {

	grunt.loadNpmTasks( 'grunt-shell' );

	// Default task(s).
	grunt.registerTask( 'default', ['shell:sync'] );

	// Project configuration.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		shell: {
			sync: {
				command: 'hexo generate && rsync -a ./public/* ./../blog',
				options: {
					stdout: true
				}
			}
		}
	} );

};