'use strict';

module.exports = function (grunt) {

	//
	// LOAD PLUGINS
	//

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');

	//
	// DEFINE TASKS
	//

	grunt.registerTask('default', ['all']);

	// app task
	grunt.registerTask('all', ['clean', 'browserify:libs', 'browserify:app']);

	// server task
	grunt.registerTask('server', ['connect', 'all', 'watch:fast']);
	grunt.registerTask('server-slow', ['connect', 'all', 'watch:slow']);

	grunt.initConfig({

		// ===================
		// Config
		// ===================

		distdir: 'dist',
		libsdir: 'libs',
		src: {
			js: './*.js'
		},

		watch: {
			fast: {
				files: '<%= src.js %>',
				tasks: ['browserify:app'],
				options: {
					livereload: true,
					nospawn: true
				}
			},
			slow: {
				files: ['<%= libsdir %>', '<%= src.js %>'],
				tasks: ['all'],
				options: {
					livereload: true,
					nospawn: true
				}
			}
		},

		// clear previous build artifacts
		clean: {
			build: ['<%= distdir %>/*']
		},

		//
		// browserify
		//
		browserify: {
			all: {
				options: {
					shim: {
						jquery: { path: '<%= libsdir %>/jquery.js', exports: '$' },
						angular: { path: '<%= libsdir %>/angular.js', exports: 'angular', depends: { jquery: '$' } }
					},
					alias: [
						'<%= libsdir %>/angular.js:angular',
						'<%= libsdir %>/jquery.js:jquery'
					]
				},
				src: ['./**/*.js'],
				dest: '<%= distdir %>/app.js'
			},
			libs: {
				options: {
					shim: {
						jquery: { path: '<%= libsdir %>/jquery.js', exports: '$' },
						angular: { path: '<%= libsdir %>/angular.js', exports: 'angular', depends: { jquery: '$' } }
					}
				},
				src: ['./<%= libsdir %>/*.js'],
				dest: '<%= distdir %>/libs.js'
			},
			app: {
				src: ['src/app.js'],
				dest: '<%= distdir %>/app.js',
				options: {
					alias: [
						'<%= libsdir %>/angular.js:angular',
						'<%= libsdir %>/jquery.js:jquery'
					],
					external: [
						'<%= libsdir %>/angular.js',
						'<%= libsdir %>/jquery.js'
					]
				}
			}
		},

		connect: {
			all: {
				options: {
					port: 9001,
					hostname: '0.0.0.0',
					base: '<%= distdir %>',
					middleware: function (connect, options) {
						return [require('connect-livereload')(), connect.static(options.base)];
					}
				}
			}
		}

	});

};
