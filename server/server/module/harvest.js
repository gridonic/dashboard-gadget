'use strict';

function harvestModule () {

    // Functions
    var construct;
    var getProject;
    var getWorkTime;
    var loadDataFromHarvest;
    var setCredentials;

    // Models
    var harvest = require('harvest');
    var project = require('./../model/project.js');
    var Project = new project();

    // Variables
    var Harvest = null;
    var TimeTracking = null;
    var actualTime = 0;
    var actualTimePercent = 0;
    var actualProject = null;
    var entries;
    var i;
    var progressTime;
    var progressProject;
    var allProjects;

    // Constants
    var DAILY_WORKING_HOUR = 8;

    /* =====================================================================
     * Public functions
     * ===================================================================== */
    this.construct = function (mongoose) { return construct (mongoose); };
    this.getProject = function () { return getProject(); };
    this.getWorkTime = function () { return getWorkTime(); };
    this.setCredentials = function (credentials) { return setCredentials(credentials); };

    /* =====================================================================
     * Private functions
     * ===================================================================== */

    construct = function (mongoose) {
        Project.construct(mongoose);

        Project.getAllProjects(function (result) {
            allProjects = result;
        });
    };

    /**
     * Get actual work time in percent.
     * @returns {null|number}
     */
    getWorkTime = function () {
        if (Harvest === null) {
            return null;
        }

        actualTimePercent = Math.round(actualTime * 100 / DAILY_WORKING_HOUR);
        return actualTimePercent;
    };

    getProject = function () {
        if (Harvest === null) {
            return null;
        }

        return actualProject;
    };

    /**
     * Load data from harvest.
     *  - Set actualTime
     *  - Set actualProject
     */
    loadDataFromHarvest = function () {
        TimeTracking.daily({}, function(err, tasks) {
            if (err) {
                console.log('error on TimeTracking.daily');
                console.log(err);
            } else {
                entries = tasks.day_entries;
                progressTime = 0;
                progressProject = {};

                for (i = 0; i < entries.length; i++) {
                    progressTime += entries[i].hours;
                    if (entries[i].timer_started_at) {
                        progressProject = {
                            project_id: entries[i].project_id,
                            project: entries[i].project,
                            task: entries[i].task,
                            client: entries[i].client,
                        };

                        Project.getProjectColor(progressProject, function (project, result) {
                            progressProject = {
                                project_id: project.project_id,
                                project: project.project,
                                task: project.task,
                                client: project.client,
                                color: result.projectColor,
                            };

                            actualProject = progressProject;

                            Project.getAllProjects(function (result) {
                                allProjects = result;
                            });
                        });

                    }
                }

                actualTime = progressTime;
                actualProject = progressProject;
            }
        });
    };

    /**
     * Set the credentials and initialise Harvest.
     * @param credentials
     */
    setCredentials = function(credentials) {
        Harvest = new harvest({
            subdomain: credentials.domain,
            email: credentials.email,
            password: credentials.password
        });

        TimeTracking = Harvest.TimeTracking;

        if (Harvest != null) {
            loadDataFromHarvest();
            setInterval(function () {
                loadDataFromHarvest();
            }, 30000);
        }
    };
}

module.exports = harvestModule;