'use strict';

module.exports = function (grunt) {

	//
	// LOAD ALL GRUNT-* PLUGINS
	//

	require('matchdep').filterDev('grunt-*').filter(function (_) { return _ !== 'grunt-cli'; }).forEach(grunt.loadNpmTasks);

	//
	// DEFINE TASKS
	//

	grunt.registerTask('default', ['dev']);

	// dev task
	grunt.registerTask('dev', ['clean:artifacts', 'copy', 'build-less-dev', 'build-js-dev']);
	grunt.registerTask('build-less-dev', ['concat', 'less:dev']);
	grunt.registerTask('build-js-dev', ['jshint:dev', 'html2js', 'browserify:libs', 'browserify:dev']);

	// prod task
	grunt.registerTask('prod', ['clean:artifacts', 'copy', 'build-less-prod', 'build-js-prod']);
	grunt.registerTask('build-less-prod', ['concat', 'less']);
	grunt.registerTask('build-js-prod', ['jshint:prod', 'html2js', 'browserify:libs', 'browserify:prod', 'uglify']);

	// server task
	grunt.registerTask('server', ['connect', 'dev', 'watch']);
	grunt.registerTask('server-ie', ['dev', 'shell:server']);

	// test task
	grunt.registerTask('test', ['browserify:test', 'mochaTest']);

	// install pre-commit hook
	grunt.registerTask('hookmeup', ['clean:hooks', 'shell:hooks']);

	// this makes it so only changed files are linted
	// should probably be abstracted at some point but works for now
	var changedFiles = Object.create(null);
	var onChange = grunt.util._.debounce(function () {
		grunt.config(['jshint', 'dev', 'files', 'src'], Object.keys(changedFiles));
		changedFiles = Object.create(null);
	}, 100);
	grunt.event.on('watch', function (action, filepath) {
		if (filepath.substr(-3) === '.js') {
			changedFiles[filepath] = action;
			onChange();
		}
	});

	grunt.initConfig({

		// ===================
		// Config
		// ===================

		distdir: 'dist',
		tempdir: 'temp',
		bowerdir: '<%= vendordir %>/components',
		vendordir: 'vendor',
		assetsdir: 'src/assets',
		src: {
			img: '<%= assetsdir %>/img/**/*.*',
			tpl: 'src/**/*.tpl.html',
			js: 'src/**/*.js',
			tests: 'src/**/*.spec.js',
			less: '<%= assetsdir %>/less/**/*.less'
		},

		// ===================
		// Watchers
		// ===================

		watch: {
			assets: {
				files: [
					'<%= src.img %>',
					'src/modules/podContents/podContentsTemplate.html',
					'src/modules/map/mapTemplate.html'
				],
				tasks: ['copy:resources'],
				options: {
					livereload: true
				}
			},
			js: {
				files: '<%= src.js %>',
				tasks: ['jshint:dev', 'browserify:dev'],
				options: {
					livereload: true,
					nospawn: true
				}
			},
			less: {
				files: '<%= src.less %>',
				tasks: ['build-less-dev'],
				options: {
					livereload: true
				}
			},
			tpl: {
				files: '<%= src.tpl %>',
				tasks: ['html2js', 'browserify:dev'],
				options: {
					livereload: true
				}
			}
		},

		// ===================
		// Basics
		// ===================

		// clear previous build artifacts
		clean: {
			artifacts: ['<%= distdir %>/*', '<%= tempdir %>/*'],
			hooks: ['.git/hooks/pre-commit']
		},

		// copy files to destinations
		copy: {
			resources: {
				files: [
					{
						expand: true,
						flatten: true,
						src: [
							'<%= assetsdir %>/img/*',
							'<%= vendordir %>/leaflet/images/*',
							'<%= bowerdir%>/bootstrap/img/*'
						],
						dest: '<%= distdir %>/images'
					},
					{
						expand: true,
						flatten: true,
						src: [
							'<%= bowerdir %>/font-awesome/font/*',
						],
						dest: '<%= distdir %>/fonts'
					},
					{
						src: 'src/index.html',
						dest: '<%= distdir %>/index.html'
					},
					{
						src: 'src/modules/podContents/podContentsTemplate.html',
						dest: '<%= distdir %>/modules/podContents/podContentsTemplate.html'
					},
					{
						src: 'src/modules/map/mapTemplate.html',
						dest: '<%= distdir %>/modules/map/mapTemplate.html'
					}
				]
			}
		},

		// ===================
		// JavaScript
		// ===================

		//
		// code quality!
		//
		jshint: {
			options: {
				browser: true,
				eqeqeq: true,
				eqnull: true,
				expr: true,
				immed: true,
				globalstrict: true,
				latedef: true,
				maxdepth: 3,
				maxparams: 10,
				maxcomplexity: 15,
				multistr: true,
				newcap: true,
				noarg: true,
				noempty: true,
				nonew: true,
				onecase: true,
				quotmark: 'single',
				smarttabs: true,
				sub: true,
				undef: true,
				globals: {
					module: true,
					exports: true,
					require: true,
					describe: true,
					before: true,
					beforeEach: true,
					expect: true,
					it: true
				}
			},
			dev: {
				options: {
					devel: true, // enable console.log
					debug: true,
					force: true // do not crash live reload if something happens
				},
				files: {
					src: ['./Gruntfile.js', '<%= src.js %>', '<%= src.tests %>']
				}
			},
			prod: {
				files: {
					src: ['./Gruntfile.js', '<%= src.js %>', '<%= src.tests %>']
				}
			}
		},

		// Run shell commands
		shell: {
			hooks: {
				command: 'cp ./git-hooks/pre-commit .git/hooks/'
			},
			server: {
				command: 'node ../web-server.js',
				options: {
					execOptions: {
						cwd: 'dist'
					}
				}
			}
		},

		//
		// tests
		//
		mochaTest: {
			all: {
				options: {
					reporter: 'dot',
					require: './test/support'
				},
				src: ['<%= tempdir %>/app.spec.js']
			}
		},

		//
		// html2js
		//
		html2js: {
			app: {
				options: {
					base: 'src/modules'
				},
				src: ['<%= src.tpl %>'],
				dest: '<%= tempdir %>/templates.js',
				module: 'app.templates'
			}
		},

		//
		// browserify
		//
		browserify: {
			libs: {
				options: {
					shim: {
						jquery: { path: '<%= vendordir %>/jquery.js', exports: '$' },
						dropdown: { path: '<%= bowerdir %>/bootstrap/js/bootstrap-dropdown.js', exports: null, depends: { jquery: '$' } },
						angular: { path: '<%= vendordir %>/angular.js', exports: 'angular', depends: { jquery: '$' } },
						leaflet: { path: '<%= vendordir %>/leaflet/leaflet.js', exports: 'L' },
						'leaflet.label': { path: '<%= vendordir %>/leaflet-label/leaflet.label-src.js', exports: null, depends: { leaflet: 'L' } },
						jenks: { path: '<%= vendordir %>/jenks.js', exports: 'jenks' },
						'leaflet.touchhover': { path: '<%= vendordir %>/leaflet-touchhover.js', exports: null, depends: { leaflet: 'L' } },
						'leaflet.toolbar': { path: '<%= vendordir %>/leaflet-toolbar.js', exports: null, depends: { leaflet: 'L' } }
					},
					aliasMappings: [], external: []
				},
				src: ['./<%= vendordir %>/*.js', './<%= vendordir %>/leaflet/leaflet.js'],
				dest: '<%= distdir %>/libs.js'
			},
			options: {
				alias: [
					'<%= tempdir %>/templates.js:templates',
					'test/support/fixtures/index.js:fixtures'
				],
				aliasMappings: [
					{
						cwd: 'src/common/',
						src: ['**/*.js', '!**/*.spec.js'],
						dest: 'common/'
					}
				],
				external: [
					'angular',
					'jquery',
					'dropdown',
					'leaflet',
					'leaflet.label',
					'leaflet.touchhover',
					'leaflet.toolbar',
					'jenks'
				]
			},
			dev: {
				src: ['src/app.js'],
				dest: '<%= distdir %>/app.js',
				options: {
					debug: true
				}
			},
			prod: {
				src: ['src/app.js'],
				dest: '<%= distdir %>/app.js'
			},
			test: {
				src: ['src/**/*.spec.js', '!src/**/Storage.spec.js'],
				dest: '<%= tempdir %>/app.spec.js'
			}
		},

		//
		// uglify
		//
		uglify: {
			options: {
				report: 'gzip'
			},
			prod: {
				files: {
					'<%= distdir %>/app.js': ['<%= distdir %>/app.js']
				}
			}
		},

		// ========================================
		// LESS CSS
		// ========================================

		concat: {
			leaflet: {
				src: [
					'<%= vendordir %>/leaflet/leaflet.css',
					'<%= vendordir %>/leaflet-label/leaflet.label.css'
				],
				dest: '<%= tempdir %>/leaflet.css'
			},
			variables: {
				src: [
					'<%= bowerdir %>/bootstrap/less/variables.less',
					// SK Bootstrap variables
					'<%= assetsdir %>/less/variables.less',
					'<%= bowerdir %>/bootstrap/less/mixins.less'
				],
				dest: '<%= tempdir %>/variables.less'
			},
			fontawesome: {
				src: [
					'<%= bowerdir %>/font-awesome/less/variables.less',
					// SK Bootstrap variables
					'<%= assetsdir %>/less/variables.less',
					'<%= bowerdir %>/font-awesome/less/mixins.less',
					'<%= bowerdir %>/font-awesome/less/path.less',
					'<%= bowerdir %>/font-awesome/less/core.less',
					'<%= bowerdir %>/font-awesome/less/bootstrap.less',
					'<%= bowerdir %>/font-awesome/less/extras.less',
					'<%= bowerdir %>/font-awesome/less/icons.less',
				],
				dest: '<%= tempdir %>/font-awesome.less'
			},
			bootstrap: {
				src: [
					'<%= tempdir %>/variables.less',

					// reset
					'<%= bowerdir %>/bootstrap/less/reset.less',

					// grid
					'<%= bowerdir %>/bootstrap/less/scaffolding.less',
//					'<%= bowerdir %>/bootstrap/less/grid.less',
//					'<%= bowerdir %>/bootstrap/less/layouts.less',

					// base
					'<%= bowerdir %>/bootstrap/less/type.less',
//					'<%= bowerdir %>/bootstrap/less/code.less',
					'<%= bowerdir %>/bootstrap/less/forms.less',
					'<%= bowerdir %>/bootstrap/less/tables.less',

					// common
					'<%= bowerdir %>/bootstrap/less/sprites.less',
					'<%= bowerdir %>/bootstrap/less/dropdowns.less',
					'<%= bowerdir %>/bootstrap/less/wells.less',
					'<%= bowerdir %>/bootstrap/less/component-animations.less',
					'<%= bowerdir %>/bootstrap/less/close.less',

					// buttons & alerts
					'<%= bowerdir %>/bootstrap/less/buttons.less',
					'<%= bowerdir %>/bootstrap/less/button-groups.less',
					'<%= bowerdir %>/bootstrap/less/alerts.less',

					// nav
					'<%= bowerdir %>/bootstrap/less/navs.less',
					'<%= bowerdir %>/bootstrap/less/navbar.less',
//					'<%= bowerdir %>/bootstrap/less/breadcrumbs.less',
//					'<%= bowerdir %>/bootstrap/less/pagination.less',
//					'<%= bowerdir %>/bootstrap/less/pager.less',

					// popovers
//					'<%= bowerdir %>/bootstrap/less/modals.less',
//					'<%= bowerdir %>/bootstrap/less/tooltip.less',
//					'<%= bowerdir %>/bootstrap/less/popovers.less',

					// misc
//					'<%= bowerdir %>/bootstrap/less/thumbnails.less',
//					'<%= bowerdir %>/bootstrap/less/media.less',
//					'<%= bowerdir %>/bootstrap/less/labels-badges.less',
//					'<%= bowerdir %>/bootstrap/less/progress-bars.less',
//					'<%= bowerdir %>/bootstrap/less/accordion.less',
//					'<%= bowerdir %>/bootstrap/less/carousel.less',
//					'<%= bowerdir %>/bootstrap/less/hero-unit.less',

					// utility
					'<%= bowerdir %>/bootstrap/less/utilities.less',

					// SK Bootstrap overrides
					'<%= assetsdir %>/less/bootstrap.less',
				],
				dest: '<%= tempdir %>/bootstrap.less'
			},
			common: {
				src: [
					'<%= tempdir %>/variables.less',
					'<%= assetsdir %>/less/common.less'
				],
				dest: '<%= tempdir %>/common.less'
			}
		},

		less: {
			dev: {
				files: {
					'<%= distdir %>/stylesheets/app.css': [
						'<%= tempdir %>/bootstrap.less',
						'<%= tempdir %>/font-awesome.less',
						'<%= tempdir %>/leaflet.css',
						'<%= tempdir %>/common.less'
					],
					'<%= distdir %>/stylesheets/app.ie.css': [
						'<%= vendordir %>/leaflet/leaflet.ie.css',
						'<%= assetsdir %>/less/ie.less'
					],
					'<%= distdir %>/stylesheets/app.ios.css': [
						'<%= assetsdir %>/less/ios.less'
					]
				}
			},
			prod: {
				options: {
					compress: true
				},
				files: { // a hack to compress files w/out copy&paste config
					'<%= distdir %>/stylesheets/app.css': ['<%= distdir %>/stylesheets/app.css'],
					'<%= distdir %>/stylesheets/app.ie.css': ['<%= distdir %>/stylesheets/app.ie.css'],
					'<%= distdir %>/stylesheets/app.ios.css': ['<%= distdir %>/stylesheets/app.ios.css']
				}
			}
		},

		// ===================
		// Connect
		// ===================
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
