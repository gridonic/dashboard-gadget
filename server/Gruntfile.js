/* eslint-disable global-require */
module.exports = function init(grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-config')(grunt, {
        data: {
            root: '.',
            src: 'src',
            dst: 'web'
        }
    });
};
