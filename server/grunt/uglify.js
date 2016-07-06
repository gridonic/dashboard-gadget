module.exports = {
    all: {
        files: [{
            expand: true,
            cwd: '<%= dst %>/js',
            src: '**/*.js',
            dest: '<%= dst %>/js'
        }]
    }
};
