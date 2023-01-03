/*
 * grunt-wp-content-sync
 * https://github.com/ChaseWPDEV/grunt-wp-content-sync
 *
 * Copyright (c) 2021 Chase Gruszewski
 * Licensed under the MIT license.
 */

'use strict';

const { wpContentSync, wpContentUpload }= require('./functions.js');

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('wp-content-upload', 'upload portion of sync', function(target){
        let done=this.async();
        wpContentUpload(target).then(function(res){
            if(res.status === 200){
                done(res);
            } else{
                grunt.fail.warn("File unable to write--exiting");;
            }
        });
    });


    grunt.registerMultiTask('wp_content_sync', 'The anti-page-builder. Allows you to directly sync a local HTML file with post content on your site.',
        wpContentSync);


};
