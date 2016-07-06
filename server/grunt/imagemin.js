module.exports = {
    static: {                                  // Target
        options: {                          // Target options
            optimizationLevel: 3,
            svgoPlugins: [{ removeViewBox: false }]
        },
        files: [{
            expand: true,
            cwd: '<%= src %>/public/img',
            src: ['**/*.{png,jpg,gif,svg}'],    // Actual patterns to match
            dest: '<%= dst %>/img'
        }]
    }
};
