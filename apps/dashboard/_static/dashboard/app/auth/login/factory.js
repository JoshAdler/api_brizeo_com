angular.module("loginApp").factory("loginFactory", ['$http', '$q', function ($http, $q) {

    var factory = {};

    factory.APIAuthLogin = function (options) {

        var d = $q.defer();

        var defaults = {
            "format": "json"
        };

        $http.post("/dashboard/api/v1/auth/login", _.extend(defaults, options)).then(function (data, status, headers, config) {

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