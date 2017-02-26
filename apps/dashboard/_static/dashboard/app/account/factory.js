angular.module("accountApp").factory("accountFactory", ['$http', '$q', function ($http, $q) {

    var factory = {};

    factory.APIAccount = function (options) {

        var d = $q.defer();

        var defaults = {
            "format": "json"
        };

        $http.get("/dashboard/api/v1/account", {params: _.extend(defaults, options)}).then(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);

        }).catch(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);

        }).finally(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);

        });

        return d.promise;
    };

    factory.APIAccountUpdate = function (options) {

        var d = $q.defer();

        var defaults = {
            "format": "json",
        };

        $http.patch("/dashboard/api/v1/account", _.extend(defaults, options)).then(function (data, status, headers, config) {

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