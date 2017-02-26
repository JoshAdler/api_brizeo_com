angular.module("resetApp").factory("resetFactory", ['$http', '$q', function ($http, $q) {

    var factory = {};

    factory.APIAuthReset = function (options) {

        var d = $q.defer();

        var defaults = {
            "format": "json",
            "username": ""
        };

        $http.post("/dashboard/api/v1/auth/reset", _.extend(defaults, options)).then(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);

        }).catch(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);

        }).finally(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);


        });

        return d.promise;
    };

   factory.APIAuthSaveNewPassword = function (options) {

        var d = $q.defer();

        var defaults = {
            "format": "json"
        };

        $http.post("/dashboard/api/v1/auth/reset/save", _.extend(defaults, options)).then(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);

        }).catch(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);

        }).finally(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);


        });

        return d.promise;
    };

    return factory;

}]);