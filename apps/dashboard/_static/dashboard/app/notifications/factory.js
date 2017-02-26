angular.module("notificationsApp").factory("notificationsFactory", ['$http', '$q', function ($http, $q) {

	var factory = {};

	factory.APINotifications = function (options) {

		var d = $q.defer();

		var defaults = {
			"format": "json"
		};

		$http.get("/dashboard/api/v1/notifications", {params: _.extend(defaults, options)}).then(function (data, status, headers, config) {

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

		$http.post("/dashboard/api/v1/notifications", _.extend(defaults, options)).then(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).catch(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).finally(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		});

		return d.promise;
	};


	factory.APINotificationsDelete = function (options) {

		var d = $q.defer();

		var defaults = {
			"format": "json"
		};

		$http.delete("/dashboard/api/v1/notifications", {params: _.extend(defaults, options)}).then(function (data, status, headers, config) {

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