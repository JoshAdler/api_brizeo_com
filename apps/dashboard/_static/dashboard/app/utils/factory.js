/**
 This module will control all the error messages.

 @dependency: $scope             toastr - the main scope
 */
angular.module("utilsApp").factory("utilsFactory", ["$http", "$q", function ($http, $q) {

	var factory = {};

	factory.APIUtilsGetCountries = function (options) {

		var d = $q.defer();

		var defaults = {
			"format": "json"
		};

		$http.get("/dashboard/api/v1/utils/countries", {params: _.extend(defaults, options)}).then(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).catch(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).finally(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		});

		return d.promise;
	};

	factory.APIUtilsHours = function (options) {

		var d = $q.defer();

		var defaults = {
			"format": "json"
		};

		$http.get("/dashboard/api/v1/utils/hours", {params: _.extend(defaults, options)}).then(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).catch(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).finally(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		});

		return d.promise;
	};


	factory.APINotifications = function (options) {

		var d = $q.defer();

		var defaults = {
			"format": "json"
		};

		$http.get("/dashboard/api/v1/utils/notifications", {params: _.extend(defaults, options)}).then(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).catch(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).finally(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		});

		return d.promise;
	};

	factory.APINotificationsAdd = function (options) {

		var d = $q.defer();

		var defaults = {
			"format": "json"
		};

		$http.post("/dashboard/api/v1/utils/notifications/add", _.extend(defaults, options)).then(function (data, status, headers, config) {

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