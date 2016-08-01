'use strict';

function project () {

    // functions
    var construct;
    var getAllProjects;
    var getProjectColor;

    // variables
    var projectModel;
    var projectSchema;
    var projectMongoose;
    var actualColor = 0;

    var projectColors = {
        '0':    0   + '|' + 0   + '|' + 128,    // navy
        '1':    0   + '|' + 0   + '|' + 255,    // blue
        '2':    0   + '|' + 128 + '|' + 0,      // green
        '3':    0   + '|' + 128 + '|' + 128,    // teal
        '4':    0   + '|' + 255 + '|' + 0,      // lime
        '5':    0   + '|' + 255 + '|' + 255,    // aqua
        '6':    128 + '|' + 0   + '|' + 0,      // maroon
        '7':    128 + '|' + 0   + '|' + 128,    // purple
        '8':    128 + '|' + 128 + '|' + 0,      // olive
        '9':    128 + '|' + 128 + '|' + 128,    // gray
        '10':   192 + '|' + 192 + '|' + 192,    // silver
        '11':   255 + '|' + 0   + '|' + 0,      // red
        '12':   255 + '|' + 0   + '|' + 255,    // fuchsia
        '13':   255 + '|' + 255 + '|' + 0,      // yellow
        '14':   255 + '|' + 255 + '|' + 255,    // white
    };

    this.construct          = function (mongoose) { return construct(mongoose);};
    this.getAllProjects     = function (callback) { return getAllProjects(callback); };
    this.getProjectColor    = function (project, callback) { return getProjectColor(project, callback);};

    /**
     * Construct the ProjectSchema and the ProjectModel.
     * Do it the mongoose way.
     *
     * @param mongoose
     */
    construct = function (mongoose) {

        projectMongoose = mongoose;

        var Schema = projectMongoose.Schema;

        projectSchema = new Schema({
            projectId: String,
            projectColor: String
        });

        projectModel = projectMongoose.model('projectModel', projectSchema);
        console.log('constructed the projectModel!');

        projectModel.find({}, function (err, result) {
            if (result.length > 0) {
                actualColor = result.length;
            }
        });
    };

    getAllProjects = function (callback) {
        projectModel.find({}, function (err, result) {
            callback(result);
        });
    };

    /**
     * Gets the color of a project
     *
     * @returns {*}
     */
    getProjectColor = function (project, callback) {

        var finalProject = new projectModel({
            projectId: project.project_id,
        });

        projectModel.findOne({projectId: project.project_id}, function(err, result) {

            if (result === null) {
                var color = projectColors[actualColor.toString()];
                finalProject.projectColor = color;
                actualColor++;
                if (actualColor >= projectColors.length) {
                    actualColor = 0;
                }

                projectModel.findOneAndRemove({projectColor: color}, {}, function (err, result) {
                    // old project with this model should be deleted.
                    finalProject.save(function (error, newProject) {
                        // project should be saved.
                        callback(project, newProject);
                    });
                });
            } else {
                callback(project, result);
            }
        });

    };

}

module.exports = project;