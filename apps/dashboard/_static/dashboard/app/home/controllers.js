/**
 * Account Settings Controller
 */
angular.module("homeApp").controller('homeCtrl', ['$scope', '$log', 'utilsServices', '$filter', function ($scope, $log, utilsServices, $filter) {

	$scope.utilsServices = utilsServices;

	/**
	 * execute after service is ready with data.
	 */
	$scope.$watch(function () {
		return $scope.utilsServices.memberProfile;
	}, function (newValue, oldValue) {

		if (newValue !== oldValue) {

		}
	});

}]);
