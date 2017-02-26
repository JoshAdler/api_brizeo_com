/**
 * Authentication Controller.
 *
 * @dependencies
 *     $scope           - Angular JS scope.
 *     loginFactory     - authentication factory
 *     logger           - logging and notification factory.
 */
angular.module("accountApp").controller('accountCtrl', ['$scope', '$q', '$timeout', 'accountFactory', 'utilsFactory', 'utilsServices', 'SweetAlert', 'Upload', function ($scope, $q, $timeout, accountFactory, utilsFactory, utilsServices, SweetAlert, Upload) {

    /**
     * notification factory.
     */
    $scope.utilsServices = utilsServices;

    $scope.accountFactory = accountFactory;

    /**
     * User account update
     */
    $scope.updateAccount = function () {

        $scope.accountFactory.APIAccountUpdate({
            business_name: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'business_name'),
            tax_id: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'tax_id'),
            trade_discount: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'trade_discount'),
            business_email: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'business_email'),
            phone: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'phone'),
            address1: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'address1'),
            address2: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'address2'),
            city: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'city'),
            state: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'state'),
            country: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'country.id'),
            latitude: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'latitude'),
            longitude: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'longitude'),
            contact_email: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'contact_email'),
            store_url: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'store_url'),
            facebook: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'facebook'),
            twitter: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'twitter'),
            google: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'google'),
            instagram: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'instagram'),
            description: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'description'),
            store_enabled: $scope.utilsServices.processObjectValue($scope.utilsServices.accountProfile, 'store_enabled')
        }).then(function (data) {
            $scope.utilsServices.processResponse(data.response);
            if (data.response.status === "success") {
                $scope.utilsServices.load();
            }
        });
    };

    /**
     * Upload business logo
     * @param file
     * @param errFiles
     */
    $scope.uploadBusinessLogo = function (file, errFiles) {

        $scope.f = file;

        $scope.errFile = errFiles && errFiles[0];

        if (file) {
            Upload.upload({
                url: '/dashboard/api/v1/account/business_logo/',
                method: 'put',
                data: {
                    file: file
                }
            }).then(function (resp) {
                $timeout(function () {

                    var response = $scope.utilsServices.processObjectValue(resp.data, 'response');

                    $scope.utilsServices.processResponse(response);

                    /**
                     * If everything is then we will get inventory ID.
                     */
                    if (response.status == "success") {
                        $scope.utilsServices.accountProfile.business_logo_url = resp.data.media.url;
                    }

                });
            }, null, function (evt) {
                // var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                // $scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + $scope.log;
            });
        }
    };

    /**
     * Upload store logo
     * @param file
     * @param errFiles
     */
    $scope.uploadStoreLogo = function (file, errFiles) {

        $scope.f = file;

        $scope.errFile = errFiles && errFiles[0];

        if (file) {
            Upload.upload({
                url: '/dashboard/api/v1/account/store_logo/',
                method: 'put',
                data: {
                    file: file
                }
            }).then(function (resp) {
                $timeout(function () {

                    var response = $scope.utilsServices.processObjectValue(resp.data, 'response');

                    $scope.utilsServices.processResponse(response);

                    /**
                     * If everything is then we will get inventory ID.
                     */
                    if (response.status == "success") {
                        $scope.utilsServices.accountProfile.store_logo_url = resp.data.media.url;
                    }

                });
            }, null, function (evt) {
                // var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                // $scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + $scope.log;
            });
        }
    };


    /**
     * Watch address auto input
     */
    $scope.$watch('utilsServices.accountProfile.address1', function (newValue, oldValue) {

        if (newValue !== oldValue && !_.isNull(newValue)) {

            if (typeof newValue == "object") {

                $scope.utilsServices.accountProfile.latitude = newValue.geometry.location.lat();

                $scope.utilsServices.accountProfile.longitude = newValue.geometry.location.lng();

                _.each(newValue.address_components, function (value, key, list) {

                    /**
                     * First we need to look for street_number
                     * @type {*|{}|{ID, TAG}}
                     */
                    if (_.find(value.types, function (type) {
                            return type == "street_number";
                        })) {

                        var street_number = value.long_name;

                        $scope.utilsServices.accountProfile.address1 = street_number;
                    }

                    /**
                     * Now we look for street address/route
                     * @type {*|{}|{ID, TAG}}
                     */
                    if (_.find(value.types, function (type) {
                            return type == "route";
                        })) {

                        var route = value.long_name;

                        $scope.utilsServices.accountProfile.address1 += ' ' + route;
                    }

                    /**
                     * Now we look for city
                     * @type {*|{}|{ID, TAG}}
                     */
                    if (_.find(value.types, function (type) {
                            return type == "locality";
                        })) {

                        var city = value.long_name;

                        $scope.utilsServices.accountProfile.city = city;
                    }

                    /**
                     * Now the provience/state
                     * @type {*|{}|{ID, TAG}}
                     */
                    if (_.find(value.types, function (type) {
                            return type == "administrative_area_level_1";
                        })) {

                        var state = value.long_name;

                        $scope.utilsServices.accountProfile.state = state;
                    }

                    /**
                     * Now the country
                     * @type {*|{}|{ID, TAG}}
                     */
                    if (_.find(value.types, function (type) {
                            return type == "country";
                        })) {

                        var country = _.find($scope.utilsServices.countries, {code: value.short_name});

                        //var country = value.long_name;

                        $scope.utilsServices.accountProfile.country = country;
                    }

                    /**
                     * Now the postal_code/zip_code
                     * @type {*|{}|{ID, TAG}}
                     */
                    if (_.find(value.types, function (type) {
                            return type == "postal_code";
                        })) {

                        var zip_code = value.long_name;

                        $scope.utilsServices.accountProfile.zip_code = zip_code;
                    }

                });

            }
            else {

            }
        }
    });

    /**
     * Watch Errors
     */
    $scope.$watch('utilsServices.accountProfile.business_name', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.business_name = null;
        }
    });

    $scope.$watch('utilsServices.accountProfile.tax_id', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.tax_id = null;
        }
    });

    $scope.$watch('utilsServices.accountProfile.trade_discount', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.trade_discount = null;
        }
    });

    $scope.$watch('utilsServices.accountProfile.business_email', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.business_email = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.phone', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.phone = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.address1', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.address1 = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.address2', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.address2 = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.city', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.city = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.state', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.state = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.country', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.country = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.latitude', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.latitude = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.longitude', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.longitude = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.store_logo', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.store_logo = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.contact_email', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.contact_email = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.store_url', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.store_url = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.facebook', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.facebook = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.twitter', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.twitter = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.google', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.google = null;
        }
    });


    $scope.$watch('utilsServices.accountProfile.instagram', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.instagram = null;
        }
    });

    $scope.$watch('utilsServices.accountProfile.description', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.description = null;
        }
    });

    $scope.$watch('utilsServices.accountProfile.store_enabled', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.errors.store_enabled = null;
        }
    });

    /**
     * execute after service is ready with data.
     */
    $scope.$watch(function () {
        return $scope.utilsServices.accountProfile;
    }, function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.utilsServices.getCountries();
        }
    });

    /**
     * Watch country list
     */
    $scope.$watch(function () {
        return $scope.utilsServices.countries;
    }, function (newValue, oldValue) {
        if (newValue !== oldValue && !_.isUndefined($scope.utilsServices.accountProfile)) {
            $scope.utilsServices.accountProfile.country = _.find($scope.utilsServices.countries, {id: $scope.utilsServices.accountProfile.country});
        }
    });
}]);
