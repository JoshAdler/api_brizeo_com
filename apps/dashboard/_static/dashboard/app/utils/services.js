angular.module("utilsApp").service("utilsServices", ['$http', '$sce', '$rootScope', '$window', '$timeout', 'Upload', '$filter', '$q', "utilsFactory", "accountFactory", "profileFactory", "notificationsFactory", function ($http, $sce, $rootScope, $window, $timeout, Upload, $filter, $q, utilsFactory, accountFactory, profileFactory, notificationsFactory) {

    /**
     ============================================================================
     HELPER FUNCTIONS & Services Shared Across Application
     ============================================================================
     */

    /**
     * making copy of this to be used inside callbacks.
     */
    var _this = this;


    /**
     * user profile will be shared across the application
     * @type {{}}
     */
    this.memberProfile = {};

    /**
     * this is used to display errors on UI
     * @type {Array}
     */
    this.errors = {};


    /**
     *
     * @type {{}}
     */
    this.notifications = {};

    /**
     * organization profile will be shared across the application
     * @type {{}}
     */
    this.accountProfile = {};

    /**
     * app settings will be shared across the application
     * @type {{}}
     */
    this.appSettings = {};

    /**
     * app settings will be shared across the application
     * @type {{}}
     */
    this.totalMembers = 0;

    /**
     * app settings will be shared across the application
     * @type {{}}
     */
    this.totalOrganizations = 0;


    /**
     * Get parameter value from from URL.
     * @param key
     * @returns {Array|{index: number, input: string}|*|string}
     */
    this.getUrlVar = function (key) {
        var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search);
        return result && unescape(result[1]) || "";
    };

    /**
     * Check if string starts with a specific character
     * @param str
     * @param prefix
     * @returns {boolean}
     */
    this.startsWith = function (str, prefix) {

        return str.lastIndexOf(prefix, 0) === 0;

    };


    this.redirectURL = function (url) {

        window.location = url;
    };


    this.beforeUnload = function () {
        // Events are broadcast outside the Scope Lifecycle
        $window.onbeforeunload = function (e) {
            var confirmation = {};
            var event = $rootScope.$broadcast('onBeforeUnload', confirmation);
            if (event.defaultPrevented) {
                return confirmation.message;
            }
        };

        $window.onunload = function () {
            $rootScope.$broadcast('onUnload');
        };
    };


    /**
     * Check if string ends with a specific character
     * @param str
     * @param suffix
     * @returns {boolean}
     */
    this.endsWith = function (str, suffix) {

        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    this.convertDateTime = function (timestamp) {

        var datetime = moment.unix(timestamp);

        return datetime.format("MMM Do YYYY, h:mm a");

    };

    /**
     * Convert html to trusted html.
     * @param html_code
     * @returns {*}
     */
    this.toTrusted = function (html_code) {
        return $sce.trustAsHtml(html_code);
    };

    /**
     * Scroll to Top
     */
    this.scrollToTop = function () {
        $("html, body").animate({scrollTop: 0}, "slow");
    };


    /**
     * check length of array
     */
    this.arrayLength = function (array) {

        try {
            if (array.length > 0) {
                return true;
            }
            else {
                return false;
            }
        }
        catch (e) {
            return false;
        }
    };


    /**
     * get members profile.
     * @returns {{}|*|string|setOrgProfile.orgProfile}
     */
    this.setTotalMembers = function (totalMembers) {

        _this.totalMembers = totalMembers;

    };


    /**
     * get members profile.
     * @returns {{}|*|string|setOrgProfile.orgProfile}
     */
    this.setTotalOrganizations = function (totalOrganizations) {

        _this.totalOrganizations = totalOrganizations;

    };

    /**
     * get members profile.
     * @returns {{}|*|string|setOrgProfile.orgProfile}
     */
    this.setMemberProfile = function (memberProfile) {
        this.memberProfile = memberProfile;

        if (!_.isNull(this.memberProfile) && !_.isUndefined(this.memberProfile)) {
            this.memberProfile.password = null;
            this.memberProfile.confirm_password = null;
        }
    };

    /**
     * set users profile
     * @param orgProfile
     */
    this.getMemberProfile = function () {

        return this.memberProfile;

    };

    /**
     * add notifications.
     */
    this.addNotifications = function (notification) {

        notificationsFactory.APINotificationsAdd({
            title: notification.title,
            description: notification.description,
            restaurant_id: notification.restaurant_id,
            account_id: notification.account_id,
            read: notification.read,
            people: notification.people,
            uuid: notification.uuid
        }).then(function (data) {

            _this.notifications.push(notification);

        });
    };

    /**
     * get notifications.
     */
    this.getNotifications = function () {

        notificationsFactory.APINotifications({
            read: false,
            no_pagination: true
        }).then(function (data) {

            return _this.notifications = data.notifications;

        });

    };

    /**
     * remove notifications.
     */
    this.removeNotifications = function (notificationToRemove) {

        notificationsFactory.APINotificationsDelete({
            id: notificationToRemove.id
        }).then(function (data) {
            _this.notifications = _.reject(_this.notifications, function (notification) {
                return notification.id == notificationToRemove.id;
            });
        });

    };


    /**
     * get errors.
     */
    this.setErrors = function (errors) {

        _this.errors = errors;

    };

    /**
     * get errors.
     */
    this.clearErrors = function () {

        _this.errors = {};

    };

    /**
     * set errors
     */
    this.getErrors = function () {

        return this.errors;

    };

    /**
     * get organization profile.
     * @returns {{}|*|string|setOrgProfile.orgProfile}
     */
    this.getAccountProfile = function () {

        return this.accountProfile;
    };

    /**
     * set organization profile
     * @param orgProfile
     */
    this.setAccountProfile = function (accountProfile) {

        this.accountProfile = accountProfile;
    };

    /**
     * get app settings
     * @returns {{}|*|appSettings|setAppSettings.appSettings}
     */
    this.getAppSettings = function () {

        return this.appSettings;
    };


    this.pusher = null;

    this.defaultChannel = null;

    this.enablePusher = function () {

        _this.pusher = new Pusher('3a0dcdce46464e6af6c6', {
            encrypted: true
        });

        _this.subscribeDefaultChannel();
    };

    this.subscribeDefaultChannel = function () {

        _this.defaultChannel = _this.pusher.subscribe(_this.orgProfile.code);

        _this.defaultChannel.bind('alert_account', function (data) {

            var notification = {
                title: data.title,
                description: data.description,
                restaurant_id: data.restaurant_id,
                account_id: data.account_id,
                read: data.read,
                people: data.people,
                uuid: data.uuid
            };

            _this.addNotifications(notification);
        });
    };

    /**
     *  set app settings
     * @param appSettings
     */
    this.setAppSettings = function (appSettings) {

        this.appSettings = appSettings;
    };


    this.timeFrom = function (time) {

        return moment(time).fromNow();
    };

    this.timeFromat = function (time) {

        return moment(time).format("DD/MM/YYYY, h:mm:ss a");
    };

    this.timeFromatUnix = function (time) {

        return moment.unix(time).format("DD/MM/YYYY");
        //return moment.unix(time).format("DD/MM/YYYY, h:mm:ss a");
    };


    this.getModuleStatus = function (moduleCode) {

        if (_.findWhere(this.orgProfile.modules, {code: moduleCode}) && _.findWhere(this.memberProfile.modules, {code: moduleCode})) {
            return 'active';
        }
        else {
            return 'disabled';
        }

    };

    this.getCountries = function () {
        utilsFactory.APIUtilsGetCountries().then(function (data) {
            _this.countries = data.countries;
        });
    };

    /**
     * logger
     */

    toastr.options = {
        "closeButton": true,
        "positionClass": "toast-top-right",
        "timeOut": "3000"
    };

    this.logIt = function (message, type) {
        return toastr[type](message);
    };

    this.logCustom = function (message, type) {
        this.logIt(message, type);
    };

    this.log = function (message) {
        this.logIt(message, 'info');
    };

    this.logWarning = function (message) {
        this.logIt(message, 'warning');
    };

    this.logSuccess = function (message) {
        this.logIt(message, 'success');
    };

    this.logError = function (message) {
        this.logIt(message, 'error');
    };


    /**
     * Check if object is null or undefined. If not then send code property.
     * @param object
     * @returns {null}
     */
    this.processObjectValue = function (object, key, defaultValue) {

        /**
         * if object is null then just send back null
         */
        if (!_.isUndefined(object) && !_.isNull(object)) {

            /**
             * if key is null then it's the object that we need to check.
             */
            if (_.isUndefined(key) || _.isNull(key)) {

                return _.isEmpty(s.clean(object)) || _.isUndefined(object) || _.isNull(object) ? null : object;
            }
            /**
             * we have both key and object. So we need to check if key exists in object and key is not undefined.
             */
            else {
                if (_.has(object, key)) {

                    /**
                     * check if key is null or undefined.
                     */
                    return _.isEmpty(s.clean(_.property(key)(object))) || _.isUndefined(_.property(key)(object)) ||
                    _.isNull(_.property(key)(object)) ? null : _.property(key)(object);
                }
                else {
                    return defaultValue || null;
                }
            }
        }
        else {
            return defaultValue || null;

        }
    };

    this.processDateRange = function (object, type) {

        /**
         * if object is null then just send back null
         */
        if (!_.isUndefined(object) && !_.isNull(object) && !_.isEmpty(s.clean(object))) {

            if (type == "start") {
                if (_.has(object, 'startDate')) {
                    return !_.isNumber(_.property('startDate')(object).unix()) || _.isEmpty(s.clean(_.property('startDate')(object))) || _.isUndefined(_.property('startDate')(object)) || _.isNull(_.property('startDate')(object)) ? null : parseInt(moment(_.property('startDate')(object)).unix());
                }
                else {
                    return null;
                }
            }
            else if (type == "end") {
                if (_.has(object, 'endDate')) {
                    return !_.isNumber(_.property('startDate')(object).unix()) || _.isEmpty(s.clean(_.property('endDate')(object))) || _.isUndefined(_.property('endDate')(object)) || _.isNull(_.property('endDate')(object)) ? null : parseInt(moment(_.property('endDate')(object)).unix());
                }
                else {
                    return null;
                }
            }
            else {
                return !_.isNumber(object).unix() || _.isEmpty(object) || _.isUndefined(object) || _.isNull(object) ? null : parseInt(moment(object).unix());

            }

        }
        else {
            return null;

        }
    };

    /**
     * This method is used to process lists we need to send to API. It plucks one key which we need to send.
     * @param object
     * @param key
     * @returns {null}
     */
    this.processList = function (object, key) {

        /**
         * if object is null then just send back null
         */
        if ((!_.isUndefined(object) && !_.isNull(object)) && (!_.isUndefined(key) && !_.isNull(key) && !_.isEmpty(s.clean(key)))) {

            /**
             * We will pluck the one key that we need to send to backend API to identify this object.
             */

            return _.size(object) < 1 || _.isUndefined(object) || _.isNull(object) ? null : _.map(object, key);
        }
        else {
            return null;
        }
    };

    /**
     * this will process the response from backend api server.
     * @param object
     * @param key
     * @returns {null}
     */
    this.processResponse = function (response) {

        /**
         * if object is null then just send back null
         */
        if (!_.isUndefined(response) && !_.isNull(response)) {


            if (_.has(response, 'code')) {

                var code = response.code;
            }

            if (_.has(response, 'detail')) {

                var detail = response.detail;
            }

            if (_.has(response, 'errors')) {

                this.setErrors(response.errors);
            }

            if (_.has(response, 'message')) {

                var message = response.message;
            }

            if (_.has(response, 'status')) {

                var status = response.status;
            }

            if (_.has(response, 'status_code')) {

                var status_code = response.status_code;
            }

            if ((!_.isUndefined(message) && !_.isNull(message)) && (!_.isUndefined(message) && !_.isNull(status))) {
                this.logCustom(message, status);
            }
        }

    };


    /**
     * Returns the table objects and methods which will be used for table pagination and sorting
     * @param collection
     * @returns {{sort: boolean, searchKeywords: string, filtered: Array, row: string, select: utilsServices.select, onFilterChange: utilsServices.onFilterChange, onNumPerPageChange: utilsServices.onNumPerPageChange, onOrderChange: utilsServices.onOrderChange, search: utilsServices.search, order: utilsServices.order, numPerPageOpt: number[], numPerPage: *, currentPage: number, currentPageObjects: Array}}
     */
    this.tableObject = function (collection, pagination, perPage) {

        if (_.isNull(pagination) || _.isUndefined(pagination)) {
            var pagination = {};
        }
        if (_.isNull(perPage) || _.isUndefined(perPage)) {
            var perPage = 0;
        }

        var numPerPageOpt = [10, 20, 50, 100];

        var object = {
            /**
             * Pagination
             */
            total_pages: pagination.total_pages,
            next_page: pagination.next_page,
            previous_page: pagination.previous_page,
            page: pagination.page,
            total_count: pagination.total_count,
            start_index: pagination.start_index,
            end_index: pagination.end_index,

            /**
             * Other table stuff
             */
            sort: true,
            showLoading: true,
            pageNumber: pagination.page,
            searchKeywords: '',
            filtered: [],
            row: '',
            select: function (page) {
                var end, start;
                start = (page - 1) * this.numPerPage;
                end = start + this.numPerPage;
                return this.currentPageObjects = this.filtered.slice(start, end);
            },
            onFilterChange: function () {
                this.select(1);
                this.currentPage = 1;
                return this.row = '';
            },
            onNumPerPageChange: function () {
                this.select(1);
                return this.currentPage = 1;
            },
            onOrderChange: function () {
                this.select(1);
                return this.currentPage = 1;
            },
            search: function () {
                this.showLoading = true;
                this.filtered = $filter('filter')(collection, this.searchKeywords);
                this.showLoading = false;
                return this.onFilterChange();
            },
            order: function (rowName) {
                this.sort = !this.sort;
                rowName = this.sort ? rowName : '-' + rowName;
                this.row = rowName;
                this.filtered = $filter('orderBy')(collection, rowName);
                return this.onOrderChange();
            },
            numPerPageOpt: numPerPageOpt,
            numPerPage: numPerPageOpt[perPage],
            currentPage: 1,
            currentPageObjects: []
        };

        object.search();

        object.select(object.currentPage);

        object.onNumPerPageChange();

        return object;
    };

    /**
     * Upload Media to AWS
     */
    this.uploadMedia = function (file, errFiles, url) {

        this.f = file;

        this.errFile = errFiles && errFiles[0];

        if (file) {
            Upload.upload({
                url: '/dashboard/api/v1/media',
                method: 'put',
                data: {
                    file: file
                }
            }).then(function (resp) {
                $timeout(function () {

                    var response = _this.processObjectValue(resp.data, 'response');

                    _this.processResponse(response);
                    /**
                     * If everything is then we will get inventory ID.
                     */
                    if (response.status == "success") {
                        file.media = resp.data.media;
                    }

                });
            }, null, function (evt) {
                // var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                // $scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + $scope.log;
            });
        }
    };

    this.uploadMediaFiles = function (files) {

        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (!file.$error) {
                    Upload.upload({
                        url: '/dashboard/api/v1/media',
                        method: 'put',
                        data: {
                            file: file
                        }
                    }).then(function (resp) {
                        $timeout(function () {
                            var response = _this.processObjectValue(resp.data, 'response');

                            _this.processResponse(response);
                            /**
                             * If everything is then we will get inventory ID.
                             */
                            if (response.status == "success") {
                                file.media = resp.data.media;
                            }

                        });
                    }, null, function (evt) {
                        // var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        // $scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + $scope.log;
                    });
                }
            }
        }
    };

    /**
     * load user profile once in this service instead of loading it in all controllers.
     * this will be shared so changes will be see in all controllers without additional calls to api.
     */
    this.load = function () {

        profileFactory.APIProfile().then(function (data) {

            /**
             * set users profile object
             */
            _this.setMemberProfile(data.profile);


            if (!_.isNull(data.account) && !_.isUndefined(data.account)) {

                /**
                 * Get account notifications
                 */
                _this.getNotifications();
            }

            /**
             * now we need to subscribe to pusher
             */
            // _this.enablePusher();

            _this.beforeUnload();

        });

        accountFactory.APIAccount().then(function (data) {

            _this.setAccountProfile(data.account);

        });
    };

    /**
     * calling function to get user profile data.
     */
    this.load();

}]);