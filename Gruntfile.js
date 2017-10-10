'use strict';

const path = require('path');
const os = require('os');
const ejs = require('ejs');
const yaml = require('js-yaml');
const marked = require('marked');

const PAGES_DIR = 'project/pages/';
const LAYOUT_DIR = 'project/layouts/';
const BUILD_DIR = 'build/';

module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            all: {
                src: [ BUILD_DIR ]
            },
            md: {
                src: [ `${BUILD_DIR}/**/*.md` ]
            }
        },

        copy: {
            all: {
                files: [
                    {
                        src: [ '**' ],
                        dest: BUILD_DIR,
                        expand: true,
                        cwd: PAGES_DIR
                    }
                ]
            }
        },

        render: {
            files: {
                src: [ '**/index.md' ],
                dest: BUILD_DIR,
                expand: true,
                cwd: BUILD_DIR,
                ext: '.html',
                filter: 'isFile'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask(
        'build',
        [
            'clean:all',
            'copy:all',
            'render',
            'clean:md'
        ]
    );

    const getLayout = function (layoutName) {
        return grunt.file.read(path.resolve(LAYOUT_DIR, layoutName + '.ejs'));
    };

    grunt.registerMultiTask('render', 'Render MD to HTML', function () {
        for (const file of this.files) {
            const mdFileParts = grunt.file.read(file.src).split(`---${os.EOL}`);

            const meta = yaml.safeLoad(mdFileParts[1]);
            const content = marked(mdFileParts[2]);

            grunt.file.write(
                file.dest,
                ejs.render(
                    getLayout(meta.layout),
                    {
                        page: {
                            meta,
                            content
                        }
                    }
                )
            );
        }
    })
};
