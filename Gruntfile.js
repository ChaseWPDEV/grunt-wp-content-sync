/*
 * grunt-wp-content-sync
 * https://github.com/ChaseWPDEV/grunt-wp-content-sync
 *
 * Copyright (c) 2021 Chase Gruszewski
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        './Gruntfile.js',
        './tasks/*.js',
      ],
      options: {
        jshintrc: '.jshintrc',
        reporterOutput: './jshint'
      }
    },

    mochaTest:{
        default:{
            src: ['test/wp_content_sync_test.js']
        },
        options:{
            clearRequireCache: true,
        }
    },
    wp_content_sync:{
        options:{
            user:'AWD_administrator',
            appPassword: "gIUbT3QvR4syx16MS6nnYxxZ",
            domain: "https://staging-advancedwoocom.kinsta.cloud",
            postType: "sfwd-topic",
        },
        awd_test1:{
            postId:2134,
            filename: "data-overview.html"
        },
        awd_test2:{
            postId: 2136,
            filename: 'data_data.html'
            }
        },
    clean: {
        default:{
            src:['./*.html', './*.html.bak']
        }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'mochaTest']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint']);

};
