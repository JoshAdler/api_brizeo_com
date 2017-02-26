/**
 * Authentication Controller.
 *
 * @dependencies
 *     $scope           - Angular JS scope.
 *     loginFactory     - authentication factory
 *     logger           - logging and notification factory.
 */
angular.module("profileApp").controller('profileCtrl', ['$scope', '$q', 'profileFactory', 'utilsFactory', 'utilsServices', 'SweetAlert', 'Upload', function ($scope, $q, profileFactory, utilsFactory, utilsServices, SweetAlert, Upload) {

	/**
	 * notification factory.
	 */
	$scope.utilsServices = utilsServices;

	$scope.profileFactory = profileFactory;

	/**
	 * User profile update
	 */
	$scope.updateProfile = function () {
		$scope.profileFactory.APIProfileUpdate({
			id: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'id'),
			first_name: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'first_name'),
			last_name: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'last_name'),
			email: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'email'),
			phone: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'phone'),
			address1: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'address1'),
			address2: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'address2'),
			city: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'city'),
			state: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'state'),
			country_id: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile.country, 'id')
		}).then(function (data) {
			$scope.utilsServices.processResponse(data.response);
			if (data.response.status === "success") {
				$scope.utilsServices.load();
			}
		});
	};


	/**
	 * Account Update
	 */
	$scope.accountUpdate = function () {
		$scope.profileFactory.APIProfileOrgUpdate({
			id: $scope.utilsServices.processObjectValue($scope.utilsServices.orgProfile, 'id'),
			name: $scope.utilsServices.processObjectValue($scope.utilsServices.orgProfile.first_name, 'name'),
			phone: $scope.utilsServices.processObjectValue($scope.utilsServices.orgProfile.first_name, 'phone'),
			address1: $scope.utilsServices.processObjectValue($scope.utilsServices.orgProfile.first_name, 'address1'),
			address2: $scope.utilsServices.processObjectValue($scope.utilsServices.orgProfile.first_name, 'address2'),
			city: $scope.utilsServices.processObjectValue($scope.utilsServices.orgProfile.first_name, 'city'),
			state: $scope.utilsServices.processObjectValue($scope.utilsServices.orgProfile.first_name, 'state'),
			country: $scope.utilsServices.processObjectValue($scope.utilsServices.orgProfile.first_name, 'country')
		}).then(function (data) {
			$scope.utilsServices.processResponse(data.response);
			if (data.response.status === "success") {
				$scope.utilsServices.load();
			}
		});
	};


	/**
	 * Refresh API Token
	 */
	$scope.refreshAPIToken = function () {
		SweetAlert.swal({
				title: utilsServices.memberProfile.first_name + ", are you sure?",
				text: 'Any API calls using old token will fail.',
				timer: 30000,
				type: "warning",
				showCancelButton: true,
				confirmButtonText: "Yes"
			},
			function (isConfirm) {
				if (isConfirm) {
					$scope.profileFactory.APIProfileResetApiToken({}).then(function (data) {
						$scope.utilsServices.processResponse(data.response);
						if (data.response.status === "success") {
							$scope.utilsServices.load();
						}
					});
				}
			});
	};


	/**
	 * Update account password
	 */
	$scope.updatePassword = function () {
		$scope.profileFactory.APIProfilePasswordUpdate({
			current_password: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'current_password'),
			new_password: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'new_password'),
			confirm_password: $scope.utilsServices.processObjectValue($scope.utilsServices.memberProfile, 'confirm_password')
		}).then(function (data) {
			$scope.utilsServices.processResponse(data.response);
			if (data.response.status === "success") {
				$scope.utilsServices.load();
			}
		});
	};

	/**
	 * Watch input fields.
	 */
	$scope.$watch('utilsServices.memberProfile.address1', function (newValue, oldValue) {

		if (newValue !== oldValue && !_.isNull(newValue)) {

			if (typeof newValue == "object") {

				$scope.utilsServices.memberProfile.latitude = newValue.geometry.location.lat();

				$scope.utilsServices.memberProfile.longitude = newValue.geometry.location.lng();

				_.each(newValue.address_components, function (value, key, list) {

					/**
					 * First we need to look for street_number
					 * @type {*|{}|{ID, TAG}}
					 */
					if (_.find(value.types, function (type) {
							return type == "street_number";
						})) {

						var street_number = value.long_name;

						$scope.utilsServices.memberProfile.address1 = street_number;
					}

					/**
					 * Now we look for street address/route
					 * @type {*|{}|{ID, TAG}}
					 */
					if (_.find(value.types, function (type) {
							return type == "route";
						})) {

						var route = value.long_name;

						$scope.utilsServices.memberProfile.address1 += ' ' + route;
					}

					/**
					 * Now we look for city
					 * @type {*|{}|{ID, TAG}}
					 */
					if (_.find(value.types, function (type) {
							return type == "locality";
						})) {

						var city = value.long_name;

						$scope.utilsServices.memberProfile.city = city;
					}

					/**
					 * Now the provience/state
					 * @type {*|{}|{ID, TAG}}
					 */
					if (_.find(value.types, function (type) {
							return type == "administrative_area_level_1";
						})) {

						var state = value.long_name;

						$scope.utilsServices.memberProfile.state = state;
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

						$scope.utilsServices.memberProfile.country = country;
					}

					/**
					 * Now the postal_code/zip_code
					 * @type {*|{}|{ID, TAG}}
					 */
					if (_.find(value.types, function (type) {
							return type == "postal_code";
						})) {

						var zip_code = value.long_name;

						$scope.utilsServices.memberProfile.zip_code = zip_code;
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
	$scope.$watch('utilsServices.memberProfile.current_password', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			$scope.utilsServices.errors.current_password = null;
		}
	});

	$scope.$watch('utilsServices.memberProfile.new_password', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			$scope.utilsServices.errors.new_password = null;
		}
	});

	$scope.$watch('utilsServices.memberProfile.confirm_password', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			$scope.utilsServices.errors.confirm_password = null;
		}
	});

	/**
	 * execute after service is ready with data.
	 */
	$scope.$watch(function () {
		return $scope.utilsServices.memberProfile;
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
		if (newValue !== oldValue) {
			$scope.utilsServices.memberProfile.country = _.find($scope.utilsServices.countries, {id: $scope.utilsServices.memberProfile.country});
		}
	});
}]);
