/*
 * Configuration file for Grunt.
 * Grunt is way easier and intuitive than
 * any build system I have used so far.
 */

/*
 * This task here is for concatenating all the scripts
 * there are two targets to concatenate the index.js file last.
 */
const concat = {
    target1: {
        src: ['web/js/*.js', '!web/js/index.js'],
        dest: 'web/dist/es6-modules.js'
    },
    target2: {
        options: {
            sourceMap: true
        },
        src: ['web/dist/es6-modules.js', 'web/js/index.js'],
        dest: 'web/dist/es6-all.js'
        
    }
}

/*
 * This task converts the ES6 to
 * ES5 from the output of the concat
 * task.
 */
const babel = {
    options: {
        sourceMap: false
    },
    dist: {
        files: {
            'web/dist/index.js': 'web/dist/es6-all.js'
        }
    }
}

/*
 * Uglify to minify the 
 * javascript.
 */
const uglify = {
    files: {
        src: 'web/dist/index.js',
        dest: 'web/dist/index.min.js'
    }
}

/*
 * This one minifies the
 * CSS.
 */
const cssmin = {
    options: {
        report: 'gzip',
        specialComments: 0
    },
    files: {
        src: 'web/css/*.css',
        dest: 'web/dist/style.min.css'
    }
}

/*
 * This one copies the font files from
 * CSS to the dist folder.
 */
const copy = {
    options: {
        processContent: false
    },
    files: {
        cwd: 'web/css/fonts',
        src: '**/*',
        dest: 'web/dist/fonts',
        expand: true
    }
}

const configuration = { concat, babel, uglify, cssmin, copy };

module.exports = function(grunt) {
    // This is a handy module to automatically
    // do all the grunt.loadNpmTasks thing.
    require('load-grunt-tasks')(grunt);
    grunt.initConfig(configuration);
    grunt.registerTask('default', ['concat:target1', 'concat:target2', 'babel', 'uglify', 'cssmin', 'copy' ]);
};
