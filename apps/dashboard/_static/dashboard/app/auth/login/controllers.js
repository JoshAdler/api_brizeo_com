angular.module("loginApp").controller('loginCtrl', ['$scope', 'loginFactory', 'utilsServices', function ($scope, loginFactory, utilsServices) {

	$scope.email = '';

	$scope.password = '';

	$scope.rememberMe = false;

	$scope.loginFactory = loginFactory;

	$scope.utilsServices = utilsServices;

	$scope.authLogin = function () {
		$scope.loginFactory.APIAuthLogin({
			email: $scope.utilsServices.processObjectValue($scope.email),
			password: $scope.utilsServices.processObjectValue($scope.password),
			remember_me: $scope.utilsServices.processObjectValue($scope.remember_me)
		}).then(function (data) {

			var response = utilsServices.processObjectValue(data, 'response');

			$scope.utilsServices.processResponse(response);
			if (response.status == "success") {
				window.location = '/dashboard';
			}

		});
	};


	$scope.$watch('email', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			$scope.utilsServices.errors.email = null;
		}
	});

	$scope.$watch('password', function (newValue, oldValue) {
		if (newValue !== oldValue) {
			$scope.utilsServices.errors.password = null;
		}
	});

}]);

