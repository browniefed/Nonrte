module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON( 'package.json' ),

		watch: {
			js: {
				files: [ 'src/**/*.js'],
				tasks: [ 'clean:tmp', 'requirejs' ],
				options: {
					interrupt: true,
					force: true
				}
			}
		},

		requirejs: {
			full: {
				options: {
					out: 'tmp/NonRTE.js'
				}
			},
			options: {
				baseUrl: 'src/',
				name: 'NonRTE',
				optimize: 'none',
				logLevel: 2,
				onBuildWrite: function( name, path, contents ) {
					return require( 'amdclean' ).clean( contents ) + '\n';
				},
				wrap: {
					startFile: 'wrapper/intro.js',
					endFile: 'wrapper/outro.js'
				}
			}
		},

		clean: {
			tmp: [ 'tmp/' ],
			build: [ 'build/' ]
		},

		concat: {
			full: {
				src: [ 'tmp/NonRTE.js'  ],
				dest: 'build/NonRTE.js'
			}
		},

		// jshint: {
		// 	files: [ 'src/**/*.js' ],
		// 	options: {
		// 		proto: true,
		// 		smarttabs: true,
		// 		boss: true,
		// 		evil: true,
		// 		laxbreak: true,
		// 		undef: true,
		// 		unused: true,
		// 		'-W018': true,
		// 		'-W041': false,
		// 		eqnull: true,
		// 		strict: true,
		// 		globals: {
		// 			define: true,
		// 			require: true,
		// 			Element: true,
		// 			window: true,
		// 			setTimeout: true,
		// 			setInterval: true,
		// 			clearInterval: true,
		// 			module: true,
		// 			document: true,
		// 			loadCircularDependency: true
		// 		}
		// 	}
		// },

		jsbeautifier: {
			files: 'build/**',
			options: {
				js: {
					indentWithTabs: true,
					spaceBeforeConditional: true,
					spaceInParen: true
				}
			}
		},

		uglify: {
			'build/NonRTE.min.js': 'build/NonRTE.js',
		},

		copy: {
			release: {
				files: [{
					expand: true,
					cwd: 'build/',
					src: [ '**/*'],
					dest: 'release/<%= pkg.version %>/'
				}, 
				{
					expand: false,
					src: [ 'sass/css/*'],
					dest: 'release/<%= pkg.version %>/'
				}
				]
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-requirejs' );
	grunt.loadNpmTasks('grunt-jsbeautifier');

	grunt.registerTask( 'default', [
		'clean:tmp',
		'requirejs',
		'clean:build',
		'concat',
		'jsbeautifier',
		'uglify',
		'copy:release'
	]);

	grunt.registerTask( 'release', [ 'default', 'copy:release' ] );

};
