'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  // Automatically load required Grunt tasks
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin'
  });

  // Configurable paths
  var config = {
    app: "./",
    name: grunt.file.readJSON('package.json').name,
    version: grunt.file.readJSON('package.json').version,
    core: "src/core/",
    bin: "bin/",
    chrome: {
      src: "src/chrome/",
      dist: "dist/chrome/"
    },
    firefox: {
      src: "src/firefox/",
      dist: "dist/firefox/"
    },
    safari: {
      src: "src/safari/",
      dist: "dist/safari/"
    },
    ie: {
      src: "src/ie/",
      dist: "dist/ie/",
      bin: ""
    },
  };

  grunt.initConfig({

    // Project settings
    config: config,

    watch: {
      scripts: {
        files: ['<%= config.core %>/**/*.{js,css,gif,jpeg,jpg,png,json,html}'],
        tasks: ['pre-build'],
        options: {
          spawn: false,
        },
      },
      cs: {
        files: ['<%= config.app %>/src/ie/**/*.dll'],
        tasks: ['pre-build'],
        options: {
          spawn: false,
        },
      },
    },


    // Grunt server and debug server setting
    connect: {
      options: {
        port: 9000,
        livereload: 35729,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      test: {
        options: {
          open: false,
          base: [
            'test',
            '<%= config.app %>'
          ]
        }
      }
    },

    //BUILD FOR FIREFOX & SAFARI
    shell: {
      run: {
        command: 'jpm run --pkgdir=<%= config.firefox.src %>'
      },
      registerCOM: {
        command: ''
      },
      firefox: {
        command: [
          'cd <%= config.firefox.dist %>',
          'jpm xpi',
          'cd ../..',
          'mv -f <%= config.firefox.dist %>\@<%= config.name %>-<%= config.version %>.xpi <%= config.bin %>firefox.xpi'
        ].join(' && ')
      },
      safari: {
        command: 'xarjs create <%= config.safari.dist %>/app.safariextension --cert cert.pem --cert apple-intermediate.pem --cert apple-root.pem --private-key privatekey.pem extension.safariextension'
      }
    },

    //BUILD FOR CHROME
    crx: {
      build: {
        "src": [
          "<%= config.chrome.dist %>**/*",
          "!.{git,svn}",
          "!*.pem"
        ],
        "dest": "<%= config.bin %>chrome.crx",
        "options": {
          "privateKey": "<%= config.chrome.src %>cert.pem",
          "maxBuffer": 5000 * 1024 //build extension with a weight up to 5MB
        }
      }
    },


    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.core %>/scripts/{,*/}*.js',
        'test/{,*/}*.js'
      ]
    },
    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.chrome.dist %>*',
            '!<%= config.chrome.dist %>.git*',
            '<%= config.safari.dist %>*',
            '!<%= config.safari.dist %>.git*',
            '<%= config.firefox.dist %>*',
            '!<%= config.firefox.dist %>.git*',
            '<%= config.ie.dist %>*',
            '!<%= config.ie.dist %>.git*'
          ]
        }]
      }
    },




    // The following *-min tasks produce minifies files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/images'
        }]
      }
    },


    htmlmin: {
      dist: {
        options: {
          // removeCommentsFromCDATA: true,
          // collapseWhitespace: true,
          // collapseBooleanAttributes: true,
          // removeAttributeQuotes: true,
          // removeRedundantAttributes: true,
          // useShortDoctype: true,
          // removeEmptyAttributes: true,
          // removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.app %>',
          src: '*.html',
          dest: '<%= config.dist %>'
        }]
      }
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    cssmin: {
      dist: {
        files: {
          '<%= config.dist %>/styles/main.css': [
            '<%= config.app %>/styles/{,*/}*.css'
          ]
        }
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= config.dist %>/scripts/scripts.js': [
            '<%= config.dist %>/scripts/scripts.js'
          ]
        }
      }
    },
    concat: {
      dist: {}
    },

    // Copies remaining files to places other tasks can use
    copy: {

      chrome: {
        files: [{
          expand: true,
          cwd: '<%= config.app %><%= config.core %>',
          dest: '<%= config.chrome.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.{png,gif,jpg}',
            'views/{,*/}*.html',
            'styles/{,*/}*.*',
            'scripts/*.js',
            'mock/*.{json,html}'
          ]
        },
        {
          expand: true,
          cwd: '<%= config.app %><%= config.chrome.src %>',
          dest: '<%= config.chrome.dist %>',
          src: [
            '_locales/{,*/}*.json',
            'manifest.json',
            '*.html',
            'scripts/*.js'
          ]
        }]
      },
      firefox: {
        files: [{
          expand: true,
          cwd: '<%= config.app %><%= config.core %>',
          dest: '<%= config.firefox.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.{png,gif,jpg}',
            'views/{,*/}*.html',
            'styles/{,*/}*.*',
            'scripts/*.js',
            'mock/*.json'
          ]
        },
        {
          expand: true,
          cwd: '<%= config.app %><%= config.firefox.src %>',
          dest: '<%= config.firefox.dist %>',
          src: [
            'index.js',
            '*.html',
            '*.json'
          ]
        }]
      },
      safari: {
        files: [{
          expand: true,
          cwd: '<%= config.app %><%= config.core %>',
          dest: '<%= config.safari.dist %>/app.safariextension',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.{png,gif,jpg}',
            'views/{,*/}*.html',
            'styles/{,*/}*.*',
            'scripts/*.js',
            'mock/*.json'
          ]
        },
        {
          expand: true,
          cwd: '<%= config.app %><%= config.safari.src %>',
          dest: '<%= config.safari.dist %>',
          src: [
            'Info.plist',
            'app.safariextension/{,*/}*.*'
          ]
        }]
      }
    },

    // Run some tasks in parallel to speed up build process
    concurrent: {
      chrome: [
        'crx:build'
      ],
      firefox: [
        'shell:firefox'
      ],
      safari: [
        'shell:safari'
      ]
    },

    // Auto buildnumber, exclude debug files. smart builds that event pages
    chromeManifest: {
      dist: {
        options: {
          buildnumber: true,
          indentSize: 2,
          background: {
            target: 'scripts/background.js',
            exclude: [
              'scripts/chromereload.js'
            ]
          }
        },
        src: '<%= config.app %>',
        dest: '<%= config.dist %>'
      }
    },

    // Compress dist files to package
    compress: {
      dist: {
        options: {
          archive: function() {
            return 'package/DallozSearch.zip';
          }
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['**/*'],
          dest: ''
        }]
      }
    }
  });

  grunt.registerTask('debug', function () {
    grunt.task.run([
      'concurrent:chrome',
      'connect:chrome',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'connect:test',
    'mocha'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'copy:chrome',
    'copy:firefox',
    'copy:safari',
    //'useminPrepare',
    //'cssmin',
    //'concat',
    //'uglify',
    //'usemin',
    //'compress',
    'concurrent:chrome',
    'concurrent:firefox',
    //'concurrent:safari', //TODO faire les certificats

  ]);
  grunt.registerTask('registerCOM', [

  ]);
  grunt.registerTask('pre-build', [
    'clean:dist',
    'copy:chrome',
    'copy:firefox',
    'copy:safari',
  ]);
  grunt.registerTask('default', [
    //'test',
    'build'
  ]);
};
