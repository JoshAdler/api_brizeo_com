angular.module("profileApp").factory("profileFactory", ['$http', '$q', function ($http, $q) {

	var factory = {};

	factory.APIProfile = function (options) {

		var d = $q.defer();

		var defaults = {
			"format": "json"
		};

		$http.get("/dashboard/api/v1/profile", {params: _.extend(defaults, options)}).then(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).catch(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).finally(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		});

		return d.promise;
	};

	factory.APIProfileResetApiToken = function (options) {

		var d = $q.defer();

		var defaults = {
			"format": "json"
		};

		$http.patch("/dashboard/api/v1/profile/api", _.extend(defaults, options)).then(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).catch(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).finally(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		});

		return d.promise;
	};

	factory.APIProfileUpdate = function (options) {

		var d = $q.defer();

		var defaults = {
			"format": "json",
		};

		$http.patch("/dashboard/api/v1/profile", _.extend(defaults, options)).then(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).catch(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).finally(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		});

		return d.promise;
	};

	factory.APIProfileOrgUpdate = function (options) {

		var d = $q.defer();

		var defaults = {
			"format": "json",
		};

		$http.post("/dashboard/api/v1/profile/org/update", _.extend(defaults, options)).then(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).catch(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		}).finally(function (data, status, headers, config) {

			d.resolve(data, status, headers, config);

		});

		return d.promise;
	};

	factory.APIProfilePasswordUpdate = function (options) {

		var d = $q.defer();

		var defaults = {
			"format": "json",
		};

		$http.patch("/dashboard/api/v1/profile/password", _.extend(defaults, options)).then(function (data, status, headers, config) {

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