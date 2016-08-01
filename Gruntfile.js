/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  require('time-grunt')(grunt);

  grunt.initConfig({

    config: {
      app: 'src/app',
      tmp: 'var/tmp/app'
    },

    clean: {
      build: {
        files: [ {
          dot: true,
          src: [
            '.tmp',
            '<%= config.tmp %>/**/*',
            '!<%= config.tmp %>/.git**/*'
          ]
        } ]
      },
      start: '.tmp'
    },

    watch: {
      js: {
        files: ['<%= config.app %>/scripts/**/*.js'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      compass: {
        files: ['<%= config.app %>/styles/**/*.{scss,sass}'],
        tasks: [ 'compass:start' ]
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.app %>/**/*.html',
          '.tmp/styles/**/*.css',
          '<%= config.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    compass: {
      options: {
        sassDir: '<%= config.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= config.app %>/images',
        javascriptsDir: '<%= config.app %>/scripts',
        fontsDir: '<%= config.app %>/styles/fonts',
        importPath: './bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      start: {
        options: {
          sourcemap: true
        }
      },
    },

    connect: {
      options: {
        port: 61235,
        hostname: '0.0.0.0',
        livereload: 35730
      },
      proxies: [
        {
          context: '/api',
          host: 'localhost',
          port: 61234,
          https: false,
          xforward: false
        }
      ],
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              require('grunt-connect-proxy/lib/utils').proxyRequest,
              connect.static('.tmp'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect().use('/static', connect.static('src/app')),
              connect().use('/static', connect.static('.tmp')),
              connect.static('src/app')
            ];
          }
        }
      }
    },

    copy: {
      build: {
        files: [ {
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.tmp %>',
          src: [
            '*.{ico,txt}',
            '*.html',
            'styles/fonts/**/*.*'
          ]
        }, {
          expand: true,
          cwd: 'bower_components/materialize/fonts',
          src: '**/*.*',
          dest: '<%= config.tmp %>/fonts'
        }
        ]
      }
    },

    filerev: {
      build: {
        src: [
          '<%= config.tmp %>/scripts/**/*.js',
          '<%= config.tmp %>/styles/**/*.css',
          '<%= config.tmp %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= config.tmp %>/styles/fonts/*',
          '!<%= config.tmp %>/images/apple-touch-icon.png',
          '!<%= config.tmp %>/images/pokeball.png',
          '!<%= config.tmp %>/images/touch-icon-192x192.png',
          '!<%= config.tmp %>/images/pokedex/*.*',
          '!<%= config.tmp %>/images/markercluster/*.*'
        ]
      }
    },

    useminPrepare: {
      html: '<%= config.app %>/index.html',
      options: {
        dest: '<%= config.tmp %>',
        flow: {
          html: {
            steps: {
              js: [ 'concat', 'uglifyjs' ],
              css: [ 'cssmin' ]
            },
            post: {}
          }
        }
      }
    },

    usemin: {
      html: [ '<%= config.tmp %>/**/*.html' ],
      css: [ '<%= config.tmp %>/styles/{,*/}*.css' ],
      options: {
        blockReplacements: {
          css: function (block) {
            var dest = grunt.filerev.summary['var/tmp/app/' + block.dest].replace('var/tmp/app/', '');
            return '<link rel="stylesheet" href="/static/' + dest + '"/>';
          },
          js: function (block) {
            var dest = grunt.filerev.summary['var/tmp/app/' + block.dest].replace('var/tmp/app/', '');
            return '<script src="/static/' + dest + '"></script>';
          }
        },
        assetsDirs: [
          '<%= config.tmp %>',
          '<%= config.tmp %>/images',
          '<%= config.tmp %>/styles',
          '<%= config.tmp %>/scripts'
        ],
        patterns: {
          css: [
            [ /(images\/.*?\.(?:gif|jpeg|jpg|png|svg))/gm, 'Replacing references to images' ]
          ]
        }
      }
    },

    imagemin: {
      build: {
        files: [ {
          expand: true,
          cwd: '<%= config.app %>/images',
          src: [ '**/*.{png,jpg,jpeg,gif}'
            //, '!pokedex/**.*'
          ],
          dest: '<%= config.tmp %>/images'
        } ]
      }
    },

    sprite: {
      build: {
        src: '<%= config.app %>/images/pokedex/*.png',
        dest: '<%= config.tmp %>/images/pokedex.png',
        destCss: '<%= config.tmp %>/styles/sprite.css',
        algorithm: 'left-right',
        algorithmOpts: {
          sort: false
        }
      },

      start: {
        src: '<%= config.app %>/images/pokedex/*.png',
        dest: '.tmp/images/pokedex.png',
        destCss: '.tmp/styles/sprite.css',
        algorithm: 'left-right',
        algorithmOpts: {
          sort: false
        }
      }
    },

    htmlmin: {
      build: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeComments: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true,
          minifyJS: true,
        },
        files: [ {
          expand: true,
          cwd: '<%= config.tmp %>',
          src: [
            '*.html'
          ],
          dest: '<%= config.tmp %>'
        } ]
      }
    },

    concurrent: {
      build: [
        'imagemin'//, 'sprite'
      ],
      start: [
        'compass:start'//, 'sprite:start'
      ]
    }
  });

  grunt.registerTask('build', [
    'clean:build',
    'useminPrepare',
    'concurrent:build',
    'concat',
    'copy:build',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('start', [
    'clean:build',
    'concurrent:start',
    'configureProxies',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
