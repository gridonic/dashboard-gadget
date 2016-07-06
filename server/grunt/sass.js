const files = [{
    expand: true,
    cwd: '<%= src %>/sass',
    src: ['**/*.scss'],
    dest: '<%= dst %>/css',
    ext: '.css'
}];

module.exports = {
    options: {
        // required by boostrap-sass
        // @see https://github.com/twbs/bootstrap-sass#d-npm--nodejs
        precision: 8
    },
    dev: {
        options: {
            sourceComments: true,
            sourceMap: true
        },
        files
    },
    prod: {
        files
    }
};
