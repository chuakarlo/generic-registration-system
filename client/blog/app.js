(function () {
    'use strict';

    angular
        .module('app', ['ui.router', 'ngMessages'])
        .config(config)
        .run(run);

    function config($locationProvider, $stateProvider, $urlRouterProvider, $httpProvider) {
        // set variable to control behaviour on initial app load
        window.initialLoad = true;

        $locationProvider.html5Mode(true);

        // default route
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('home', {
                url: '/?:page',
                templateUrl: function (stateParams) {
                    return window.initialLoad ? null :
                        '/?xhr=1' + (stateParams.page ? '&page=' + stateParams.page : '');
                }
            })
            .state('page-details', {
                url: '/page/:slug',
                templateUrl: function (stateParams) {
                    return window.initialLoad ? null :
                        '/page/' + stateParams.slug + '?xhr=1';
                }
            })
            // Added support for participant registration - Refer to BitBucket issue #7
            //-------------- Start --------------
            .state('register', {
                // Modified url and templateUrl to make the registration form work - Refer to BitBucket issue #43 
                url: '/register?orgID&evtID',
                templateUrl: function (stateParams) {
                    return '/register?orgID=' + stateParams.orgID + '&evtID=' + stateParams.evtID;
                }, 
                controller: 'Register.IndexController',
                controllerAs: 'vm'
            })
            .state('register-thanks', {
                url: '/register-thanks',
                templateUrl: '/register-thanks'
            })
            //-------------- End --------------
            .state('contact', {
                // Modified url and templateUrl to make the contact form work - Refer to BitBucket issue #42
                url: '/contact?orgID&evtID',
                templateUrl: function (stateParams) {
                    return '/contact?orgID=' + stateParams.orgID + '&evtID=' + stateParams.evtID;
                }, 
                controller: 'Contact.IndexController',
                controllerAs: 'vm'
            })
            .state('/contact-thanks', {
                url: '/contact-thanks',
                templateUrl: 'contact-thanks'
            });

        // mark all requests from angular as ajax requests
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    }

    function run($rootScope, $timeout, $location, $window) {

    }

})();