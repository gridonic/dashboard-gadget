const files = {
    '<%= dst %>/js/scripts.js': ['<%= src %>/js/web.js']
};

module.exports = {
    watch: {
        files,
        options: {
            watch: true,
            keepAlive: true,
            browserifyOptions: {
                debug: true
            }
        }
    },
    build: {
        files
    }
};
