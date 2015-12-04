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
    id: grunt.file.readJSON('package.json').id,
    version: grunt.file.readJSON('package.json').version,
    description: grunt.file.readJSON('package.json').description,
    src: "src/",
    core: "src/core/",
    bin: "bin/",
    chrome: {
      src: "src/chrome/",
      dist: "dist/chrome/"
    },
    firefoxInf43: {
      src: "src/firefoxInf43/",
      dist: "dist/firefoxInf43/"
    },

    firefoxSup43: {
      src: "src/firefoxSup43/",
      dist: "dist/firefoxSup43/"
    },
    safari: {
      src: "src/safari/",
      dist: "dist/safari/"
    },
    ie: {
      src: "src/ie/InternetExplorerExtension/InternetExplorerExtension/",
      dist: "src/ie/InternetExplorerExtension/InternetExplorerExtension/",
      bin: ""
    },
  };
  config.slugId = config.id.toLowerCase().replace('\@',"\-at\-").replace('\.', "\-dot\-");
  grunt.initConfig({

    // Project settings
    config: config,

    watch: {
      scripts: {
        files: [
                '<%= config.core %>/**/*.{js,css,gif,jpeg,jpg,png,json,html}',
                '<%= config.chrome.src %>/**/*.{js,css,gif,jpeg,jpg,png,json,html}',
                '<%= config.firefoxInf43.src %>/**/*.{js,css,gif,jpeg,jpg,png,json,html}',
                '<%= config.firefoxSup43.src %>/**/*.{js,css,gif,jpeg,jpg,png,json,html}',
                '<%= config.safari.src %>/**/*.{js,css,gif,jpeg,jpg,png,json,html}'],
        tasks: ['pre-build'],
        options: {
          spawn: false,
        },
      }/*,
      cs: {
        files: ['<%= config.ie.src %>/*.cs'],
        tasks: [],
        options: {
          spawn: false,
        },
      },*/
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
        command: 'jpm run --pkgdir=<%= config.firefoxInf43.src %>'
      },
      registerCOM: {
        command: ''
      },
      firefoxInf43: {
        command: [
          'cd <%= config.firefoxInf43.dist %>',
          'jpm xpi',
          'cd ../..',
          'mv -f <%= config.firefoxInf43.dist %><%= config.id%>-<%= config.version %>.xpi <%= config.bin %>firefoxInf43.xpi'
        ].join(' && ')
      },
      safari: {
        command: 'xarjs create <%= config.safari.dist %>/app.safariextension --cert cert.pem --cert apple-intermediate.pem --cert apple-root.pem --private-key privatekey.pem extension.safariextension'
      },
      ie: {
        //compile DLL
        //Copy DLL dans bin/
      }
    },

    json_generator: {
      firefoxInf43: {
        dest: "<%= config.firefoxInf43.dist %>/package.json", // Destination file
        options: {
          id: "<%= config.id%>",
          name: "<%= config.name%>",
          version: "<%= config.version %>",
          description: "<%= config.description %>",
          permissions:{
            "cross-domain-content": ["resource://<%= config.slugId %>/data/"]
          }
        }
      }
    },


    compress: {
      firefoxSup43: {
        options: {
          archive: '<%= config.bin %>firefoxSup43.xpi',
          mode: 'zip'
        },
        files: [
          {expand: true, cwd: '<%= config.firefoxSup43.dist %>', src: ['**']}, //FirefoxSup43
        ]
      },
      chrome: {
        options: {
          archive: '<%= config.bin %>chrome.zip',
          mode: 'zip'
        },
        files: [
          {expand: true, cwd: '<%= config.chrome.dist %>', src: ['**']}, //chrome
        ]
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
            '<%= config.firefoxSup43.dist %>*',
            '!<%= config.firefoxSup43.dist %>.git*',
            '<%= config.firefoxInf43.dist %>*',
            '!<%= config.firefoxInf43.dist %>.git*',
            //'<%= config.ie.dist %>*',
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
            'scripts/{,*/}*.js',
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
            'views/*.html',
            'scripts/*.js'
          ]
        }]
      },
      firefoxSup43: {
        files: [{
          expand: true,
          cwd: '<%= config.app %><%= config.core %>',
          dest: '<%= config.firefoxSup43.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.{png,gif,jpg}',
            'views/{,*/}*.html',
            'styles/{,*/}*.*',
            'scripts/{,*/}*.js',
            'mock/*.{json,html}'
          ]
        },
        {
          expand: true,
          cwd: '<%= config.app %><%= config.firefoxSup43.src %>',
          dest: '<%= config.firefoxSup43.dist %>',
          src: [
            'scripts/*.html',
            'scripts/*.js',
            'manifest.json'
          ]
        }]
      },

      firefoxInf43: {
        files: [{
          expand: true,
          cwd: '<%= config.app %><%= config.core %>',
          dest: '<%= config.firefoxInf43.dist %>/data',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.{png,gif,jpg}',
            'views/{,*/}*.html',
            'styles/{,*/}*.*',
            'scripts/{,*/}*.js',
            'mock/*.{json,html}'
          ]
        },
        {
          expand: true,
          cwd: '<%= config.app %><%= config.firefoxInf43.src %>',
          dest: '<%= config.firefoxInf43.dist %>',
          src: [
            'data/*',
            'data/scripts/*.js',
            'index.js',
          ]
        }]
      },
      ie: {
        files: [{
          expand: true,
          cwd: '<%= config.app %><%= config.core %>',
          dest: '<%= config.ie.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.{png,gif,jpg}',
            'views/{,*/}*.html',
            'styles/{,*/}*.*',
            'scripts/{,*/}*.js',
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
            'views/*.html',
            'scripts/*.js'
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
            'scripts/{,*/}*.js',
            'mock/*.{json,html}'
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
        'crx:build',//création d'un crx
        'compress:chrome'//zip des sources pour distribution par mail
      ],
      firefoxInf43: [
        'json_generator:firefoxInf43',//write the package.json
        'shell:firefoxInf43'//pour Firefox < 43 (.xpi via jpm)
      ],
      firefoxSup43: [
        'compress:firefoxSup43'//pour firefox > 43 (.zip renommé en .xpi)
      ],
      safari: [
        'shell:safari'
      ],
      ie: [
        //'shell:safari'
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
  grunt.registerTask('pre-build', [
    'clean:dist',
    'copy:chrome',
    'copy:firefoxInf43',
    'copy:firefoxSup43',
    'copy:safari',
    'copy:ie',
  ]);
  grunt.registerTask('build', [
    'pre-build',
    //'useminPrepare',
    //'cssmin',
    //'concat',
    //'uglify',
    //'usemin',
    'concurrent:chrome',
    'concurrent:firefoxInf43',
    'concurrent:firefoxSup43',
    'concurrent:ie',
    //'concurrent:safari', //TODO faire les certificats

  ]);
  grunt.registerTask('registerCOM', [

  ]);

  grunt.registerTask('default', [
    //'test',
    'build'
  ]);
};
