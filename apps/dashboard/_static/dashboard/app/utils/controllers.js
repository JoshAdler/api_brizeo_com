/**
 *
 */
angular.module("utilsApp").controller("utilsCtrl", ["$scope", "$resource", "$uibModal", "$q", "utilsFactory", 'utilsServices', function ($scope, $resource, $modal, $q, utilsFactory, utilsServices) {

    /**
     * utils services
     */
    $scope.utilsServices = utilsServices;

    /**
     * logger is used to show messages on UI
     */
    $scope.utilsFactory = utilsFactory;


}]);