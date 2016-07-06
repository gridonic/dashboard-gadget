module.exports = {
    js: {
        files: ['<%= src %>/js/**']
    },
    sass: {
        files: '<%= src %>/sass/**',
        tasks: ['sass:dev', 'postcss:dev']
    }
};
