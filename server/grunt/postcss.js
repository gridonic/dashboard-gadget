// Matching bootstraps level of browser compatibility except for:
//
// - no support for IE8
//
// @see https://github.com/twbs/bootstrap-sass#d-npm--nodejs
// @see http://getbootstrap.com/getting-started/#support
const autoprefixer = require('autoprefixer')({
    browsers: [
        'Android >= 4',
        'Chrome >= 20',
        'Firefox >= 24',
        'Explorer >= 9',
        'iOS >= 7',
        'Opera >= 12',
        'Safari >= 7'
    ]
});
const cssnano = require('cssnano')();
const cssstats = require('cssstats')();
const statsReporter = require('postcss-stats-reporter')();
const src = '<%= dst %>/css/*.css';

module.exports = {
    dev: {
        src,
        options: {
            processors: [
                autoprefixer
            ]
        }
    },
    prod: {
        src,
        options: {
            processors: [
                autoprefixer,
                cssnano,
                cssstats,
                statsReporter
            ]
        }
    }
};
