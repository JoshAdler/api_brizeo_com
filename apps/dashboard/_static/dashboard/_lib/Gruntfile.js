module.exports = function (grunt) {
    grunt.initConfig({
        concat: {
            dist: {
                src: [
                    /**
                     * Standard Libraries
                     */
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/jquery.browser/dist/jquery.browser.min.js',
                    'bower_components/bootstrap/dist/js/bootstrap.min.js',
                    'bower_components/bootstrap-daterangepicker/daterangepicker.js',
                    'bower_components/lodash/dist/lodash.min.js',
                    'bower_components/underscore.string/dist/underscore.string.min.js',
                    'bower_components/sweetalert/dist/sweetalert.min.js',
                    'bower_components/moment/min/moment-with-locales.min.js',
                    'bower_components/spin.js/spin.min.js',
                    'bower_components/toastr/toastr.min.js',
                    'bower_components/Waves/dist/waves.min.js',
                    'bower_components/waypoints/lib/jquery.waypoints.min.js',
                    'bower_components/wow/dist/wow.min.js',
                    'bower_components/jquery-slimscroll/jquery.slimscroll.min.js',
                    'bower_components/jquery.nicescroll/dist/jquery.nicescroll.min.js',
                    'bower_components/jquery.scrollTo/jquery.scrollTo.min.js',
                    'bower_components/jquery.counterup/jquery.counterup.min.js',
                    'bower_components/fastclick/lib/fastclick.js',
                    'bower_components/switchery/dist/switchery.min.js',
                    'bower_components/slick-carousel/slick/slick.js',

                    /**
                     * AngularJS Modules.
                     */
                    'bower_components/angular/angular.min.js',
                    'bower_components/angular-datatables/dist/plugins/bootstrap/angular-datatables.bootstrap.min.js',
                    'bower_components/angular-datatables/dist/plugins/buttons/angular-datatables.buttons.js',
                    'bower_components/angular-datatables/dist/plugins/columnfilter/angular-datatables.columnfilter.min.js',
                    'bower_components/angular-datatables/dist/plugins/fixedheader/angular-datatables.fixedheader.min.js',
                    'bower_components/angular-animate/angular-animate.min.js',
                    'bower_components/angular-aria/angular-aria.min.js',
                    'bower_components/angular-cookies/angular-cookies.min.js',
                    'bower_components/angular-resource/angular-resource.min.js',
                    'bower_components/angular-sanitize/angular-sanitize.min.js',
                    'bower_components/angular-messages/angular-messages.min.js',
                    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                    'bower_components/angular-moment/angular-moment.min.js',
                    'bower_components/angular-ui-mask/dist/mask.min.js',
                    'bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
                    'bower_components/angular-google-maps/dist/angular-google-maps.min.js',
                    'bower_components/angular-google-places-autocomplete/dist/autocomplete.min.js',
                    'bower_components/angular-daterangepicker/js/angular-daterangepicker.min.js',
                    'bower_components/ngSweetAlert/SweetAlert.min.js',
                    'bower_components/ngmap/build/scripts/ng-map.min.js',
                    'bower_components/pusher-angular/lib/pusher-angular.min.js',
                    'bower_components/angular-spinner/angular-spinner.min.js',
                    'bower_components/angular-ui-select/dist/select.min.js',
                    'bower_components/ng-tags-input/ng-tags-input.min.js',
                    'bower_components/ng-file-upload/ng-file-upload-shim.min.js',
                    'bower_components/ng-file-upload/ng-file-upload.min.js',
                    'bower_components/angular-ui-switch/angular-ui-switch.js',
                    'bower_components/angular-slick-carousel/dist/angular-slick.min.js',

                    /**
                     * Theme files
                     */
                    'js/core.js',
                    'js/theme.js',

                    /**
                     * Application Modules.
                     */
                    '!_lib/*.js',
                    '../app/*.js',
                    '../app/*/*.js',
                    '../app/*/*/*.js',
                    '../app/*/*/*/*.js'
                ],
                dest: 'build/app.js'
            }
        },
        less: {
            production: {
                files: {
                    "build/style.css": "less/style.less"
                }
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                'processImport': true,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'build/app.css': [
                        'bower_components/sweetalert/dist/sweetalert.css',
                        'bower_components/angular-ui-select/dist/select.css',
                        'bower_components/select2/select2.css',
                        'bower_components/toastr/toastr.css',
                        'bower_components/angular-google-places-autocomplete/dist/autocomplete.min.css',
                        'bower_components/bootstrap-daterangepicker/daterangepicker.css',
                        'bower_components/angular-ui-switch/angular-ui-switch.css',
                        'bower_components/ng-tags-input/ng-tags-input.css',
                        'bower_components/ng-tags-input/ng-tags-input.bootstrap.min.css',
                        'bower_components/Waves/dist/waves.min.css',
                        'bower_components/slick-carousel/slick/slick.css',
                        'bower_components/slick-carousel/slick/slick-theme.css',
                        'build/style.css'
                    ]
                }
            }
        },
        watch: {
            files: [
                'Gruntfile.js',
                'less/style.less',
                '../app/*.js',
                '../app/*/*.js',
                '../app/*/*/*.js',
                '../app/*/*/*/*.js',
                '!bower_components/*.js',
                '!node_modules/*.js'
            ],
            tasks: ['default']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['concat', 'less', 'cssmin']);
};