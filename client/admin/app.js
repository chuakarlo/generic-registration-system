(function () {
    'use strict';

    var myApp = angular
        .module('app', ['ui.router']);

    myApp.config(config)
        .run(run);

    myApp.directive('onReadFile', function($parse) {
        return {
            restrict: 'A',
            scope: false,
            link: function(scope, element, attrs) {
                var fn = $parse(attrs.onReadFile);
                
                element.on('change', function(onChangeEvent) {
                    var reader = new FileReader();
                    
                    reader.onload = function(onLoadEvent) {
                        scope.$apply(function() {
                            fn(scope, {$fileContent:onLoadEvent.target.result});
                        });
                    };

                    reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                });
            }
        };
    });

    function config($locationProvider, $stateProvider, $urlRouterProvider) {
        // default route
        $urlRouterProvider.otherwise("/pages");

        $stateProvider
            .state('pages', {
                url: '/pages',
                templateUrl: 'pages/index.view.html',
                controller: 'Pages.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'pages' }
            })
            .state('pages/add', {
                url: '/pages/add',
                templateUrl: 'pages/add-edit.view.html',
                controller: 'Pages.AddEditController',
                controllerAs: 'vm',
                data: { activeTab: 'pages' }
            })
            .state('pages/edit', {
                url: '/pages/edit/:_id',
                templateUrl: 'pages/add-edit.view.html',
                controller: 'Pages.AddEditController',
                controllerAs: 'vm',
                data: { activeTab: 'pages' }
            })
            // Added tab for manual registration of participants - Refer to BitBucket issue #14
            //-------------- Start --------------
            .state('registration', {
                url: '/registration',
                templateUrl: 'registration/index.view.html',
                controller: 'Registration.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'registration' }
            })
            //-------------- End --------------
            // Added tab for Participant Registration Configuration - Refer to BitBucket issue #36
            //-------------- Start --------------
            .state('regsConfig', {
                url: '/regsConfig',
                templateUrl: 'regsConfig/regsConfig.view.html',
                controller: 'RegsConfig.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'regsConfig' }
            })
            //-------------- End --------------
            // Added tab for importing list of participants - Refer to BitBucket issue #22
            //-------------- Start --------------
            .state('import', {
                url: '/import',
                templateUrl: 'import/index.view.html',
                controller: 'Import.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'import' }
            })
            //-------------- End --------------
            // Added tab for event check-in of participants - Refer to BitBucket issue #23
            //-------------- Start --------------
            .state('checkin', {
                url: '/checkin',
                templateUrl: 'checkin/index.view.html',
                controller: 'CheckIn.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'checkin' }
            })
            //-------------- End --------------
            // Added tab for event reports
            //-------------- Start --------------
            .state('reports', {
                url: '/reports',
                templateUrl: 'reports/index.view.html',
                controller: 'Reports.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'reports' }
            })
            //-------------- End --------------

            // Added tabs for email settings and contact form settings - Refer to BitBucket issue #1 and issue #33
            //-------------- Start --------------
            .state('emailconfig', {
                url: '/emailconfig',
                templateUrl: 'config/email.config.view.html',
                controller: 'EmailConfig.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'emailconfig' }
            })
            .state('contactconfig', {
                url: '/contactconfig',
                templateUrl: 'config/contact.config.view.html',
                controller: 'ContactConfig.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'contactconfig' }
            })
            //-------------- End --------------

            .state('account', {
                url: '/account',
                templateUrl: 'account/index.view.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            });
    }

    function run($http, $rootScope, $window) {
        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.activeTab = toState.data.activeTab;
        });
    }

    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        $.get('/token', function (token) {
            window.jwtToken = token;

            angular.bootstrap(document, ['app']);
        });
    });
})();