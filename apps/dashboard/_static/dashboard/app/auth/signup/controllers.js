angular.module("signupApp").controller('signupCtrl', ['$scope', 'utilsServices', 'signupFactory', 'utilsFactory', function ($scope, utilsServices, signupFactory, utilsFactory) {

    $scope.email = '';

    $scope.password = '';

    $scope.password_confirm = '';

    $scope.accept_terms = false;

    $scope.utilsServices = utilsServices;

    $scope.utilsFactory = utilsFactory;

    /**
     * Signup
     */
    $scope.authSignup = function () {
        signupFactory.APIAuthSignup({
            "first_name": $scope.first_name,
            "last_name": $scope.last_name,
            "email": $scope.email,
            "password": $scope.password,
            "password_confirm": $scope.password_confirm,
            "accept_terms": $scope.accept_terms
        }).then(function (data) {

            var response = $scope.utilsServices.processObjectValue(data, 'response');

            $scope.utilsServices.processResponse(response);

            if (response.status == "success") {
                window.location = '/dashboard/signup/successful';
            }
        });
    };

    $scope.resendEmail = function () {
        signupFactory.APIAuthResendEmail({
            "email": $scope.email
        }).then(function (data) {
            var response = $scope.utilsServices.processObjectValue(data, 'response');
            $scope.utilsServices.processResponse(response);
        });
    };

    /**
     * Watch the input fields.
     */
    $scope.$watch('first_name', function (newValue, oldValue) {
        if (newValue !== oldValue && !_.isUndefined($scope.utilsServices.errors)) {
            $scope.utilsServices.errors.first_name = null;
        }
    });

    $scope.$watch('last_name', function (newValue, oldValue) {
        if (newValue !== oldValue && !_.isUndefined($scope.utilsServices.errors)) {
            $scope.utilsServices.errors.last_name = null;
        }
    });

    $scope.$watch('email', function (newValue, oldValue) {
        if (newValue !== oldValue && !_.isUndefined($scope.utilsServices.errors)) {
            $scope.utilsServices.errors.email = null;
        }
    });

    $scope.$watch('password', function (newValue, oldValue) {
        if (newValue !== oldValue && !_.isUndefined($scope.utilsServices.errors)) {
            $scope.utilsServices.errors.password = null;
        }
    });

    $scope.$watch('password_confirm', function (newValue, oldValue) {
        if (newValue !== oldValue && !_.isUndefined($scope.utilsServices.errors)) {
            $scope.utilsServices.errors.password_confirm = null;
        }
    });

    $scope.$watch('accept_terms', function (newValue, oldValue) {
        if (newValue !== oldValue && !_.isUndefined($scope.utilsServices.errors)) {
            $scope.utilsServices.errors.accept_terms = null;
        }
    });

}]);

