/**
 This "utilsApp" contains all the common features we need and all helper functions.

 @dependency: ui.bootstrap      - AngularJs bootstrap UI module.
 @dependency: angularSpinner    - Spinner module. This is modified to work properly.
 */
angular.module("utilsApp", ["ui.bootstrap", "angularSpinner"]).config(function ($interpolateProvider, $locationProvider, $httpProvider, $provide) {

    /**
     adding interceptor for all Ajax calls on this page. This will show all error messages, loading spinner etc.
     It's basically a factory of $provide which AngularJS default.

     We can do alot of error handling here.
     */
    $provide.factory('httpInterceptor', function ($q, $rootScope, usSpinnerService) {
        return {
            /**
             * On request
             */
            request: function (config) {

                /**
                 * console.log(config); // Contains the data about the request before it is sent.
                 */

                /**
                 * starting spinner just before the request is initiated.
                 */
                usSpinnerService.spin('spinner-1');

                /*
                 We just made a request now lets see what happends..... Now we need to broadcast it so everyone knows about it and use it however they want.
                 "rejection" contains all the information so it can also be used.
                 */
                $rootScope.$broadcast('request', config);

                /**
                 *   Return the config or wrap it in a promise if blank.
                 */
                return config || $q.when(config);
            },

            /**
             * On request failure
             */
            requestError: function (rejection) {

                /**
                 * console.log(rejection); // Contains the data about the error on the request.
                 */

                /**
                 * stopping spinner if there was error making request
                 */
                usSpinnerService.stop('spinner-1');


                /*
                 We tried to make a request but it failed. Now we need to broadcast it so everyone knows about it and use it however they want.
                 "rejection" contains all the information so it can also be used.
                 */
                $rootScope.$broadcast('requestError', rejection);

                /**
                 *     Return the promise rejection.
                 */
                return $q.reject(rejection);
            },

            /**
             * On response success
             */
            response: function (response) {

                /**
                 * console.log(response); // Contains the data from the response.
                 */
                usSpinnerService.stop('spinner-1');

                /*
                 so call was made and we got response. Now we need to broadcast it so everyone knows about it and use it however they want.
                 "response" contains all the information so it can also be used.
                 */
                $rootScope.$broadcast('response', response);

                /**
                 * Return the response or promise.
                 */
                return response || $q.when(response);
            },

            /**
             * On response failure
             */
            responseError: function (rejection) {

                /**
                 * console.log(rejection); // Contains the data about the error.
                 */
                usSpinnerService.stop('spinner-1');


                /*
                 so call failed. Now we need to broadcast it so everyone knows about it and use it however they want.
                 "rejection" contains all the information so it can also be used.
                 */
                $rootScope.$broadcast('responseError', rejection);

                /**
                 * Return the promise rejection.
                 */
                return $q.reject(rejection);
            }
        };
    });
    /**
     * Add the interceptor to the $httpProvider.
     */
    $httpProvider.interceptors.push('httpInterceptor');

});