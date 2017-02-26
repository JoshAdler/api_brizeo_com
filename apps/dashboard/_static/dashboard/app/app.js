angular.module('appDashboard', [
	'homeApp',
	'loginApp',
	'signupApp',
	'resetApp',
	'notificationsApp',
	'profileApp',
	'accountApp',
	'inventoryApp',
	'ngResource',
	'ngCookies',
	'ui.bootstrap',
	'oitozero.ngSweetAlert',
	'ui.select',
	'ngSanitize',
	'ngFileUpload',
	'slickCarousel',
    'uiSwitch',
	'ngTagsInput',
	'uiGmapgoogle-maps',
	'google.places',
	'utilsApp'
]).config(function ($interpolateProvider, $locationProvider, uiGmapGoogleMapApiProvider, uiSelectConfig, usSpinnerConfigProvider) {

	$interpolateProvider.startSymbol('{[');

	$interpolateProvider.endSymbol(']}');

	uiSelectConfig.theme = 'select2';

	uiGmapGoogleMapApiProvider.configure({
		key: 'AIzaSyBvj20P6aP-DowWicCrp3ON-ZzSyXYPOOM',
		v: '3.20', //defaults to latest 3.X anyhow
		libraries: 'weather,geometry,visualization,places'
	});
}).run(function ($rootScope, $http, $cookies) {
	//  CSRF token compatibility with Django
	$http.defaults.headers.post['X-CSRFToken'] = $cookies.get('csrftoken');
});
