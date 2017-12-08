var _ = require('lodash');
var webpack = require('webpack');

var webpackConfig = require('./webpack.config');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        webpack: {
            once: webpackConfig,
            watch: _.assign({}, webpackConfig, {
                watch: true,
                keepalive: true
            }),
            production: (function() {
                var conf = _.clone(webpackConfig);

                var uglify = new webpack.optimize.UglifyJsPlugin({
                    mangle: true,
                    compress: true
                });

                // Enable uglifying
                conf.plugins = conf.plugins.concat([uglify]);

                return conf;
            })()
        },

        clean: ['dist']
    });

    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
    grunt.registerTask('default', ['jshint']);

};
