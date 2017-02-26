angular.module("signupApp").factory("signupFactory", ['$http', '$q', function ($http, $q) {

    var factory = {};

    factory.APIAuthSignup = function (options) {

        var d = $q.defer();

        var defaults = {
            "format": "json"
        };

        $http.post("/dashboard/api/v1/auth/signup", _.extend(defaults, options)).then(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);

        }).catch(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);

        }).finally(function (data, status, headers, config) {

            d.resolve(data, status, headers, config);

        });

        return d.promise;
    };


    factory.APIAuthResendEmail = function (options) {

        var d = $q.defer();

        var defaults = {
            "format": "json"
        };

        $http.post("/dashboard/api/v1/auth/resend/email", _.extend(defaults, options)).then(function (data, status, headers, config) {

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