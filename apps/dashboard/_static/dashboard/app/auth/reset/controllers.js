angular.module("resetApp").controller('resetCtrl', ['$scope', 'utilsServices', 'resetFactory', function ($scope, utilsServices, resetFactory) {

    $scope.email = '';

    $scope.utilsServices = utilsServices;

    $scope.resetPassword = function () {

        resetFactory.APIAuthReset({"email": $scope.email}).then(function (data) {

            var response = $scope.utilsServices.processObjectValue(data, 'response');

            $scope.utilsServices.processResponse(response);

            if (data.response.status == "success") {
                window.location.href = '/reset/successful';
            }
        });

    };

    $scope.saveNewPassword = function () {
        resetFactory.APIAuthSaveNewPassword({
            "password": $scope.password,
            "password_confirm": $scope.password_confirm,
            "password_reset_token": $scope.password_reset_token
        }).then(function (data) {
            var response = $scope.utilsServices.processObjectValue(data, 'response');

            $scope.utilsServices.processResponse(response);

            if (data.response.status == "success") {
                window.location.href = '/reset/changed';
            }

        });
    }

}]);

