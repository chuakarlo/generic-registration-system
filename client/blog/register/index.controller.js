(function () {
    'use strict';

    angular
        .module('app')
        .controller('Register.IndexController', Controller);

    function Controller($location, RegisterService, PublicRegistrationConfigService) {
        var vm = this;

        vm.register = register;

        initController();

        function initController() {
            // Make the registration form work - Refer to BitBucket issue #43
            vm.orgID = $location.search().orgID;
            vm.eventID = $location.search().evtID;

            //Customizable Participant Registration Page  - Refer to BitBucket issue #44
            PublicRegistrationConfigService.Retrieve(vm.orgID, vm.eventID).then(function (regsconfig) {
                vm.regsconfig = regsconfig;

                console.log('Config Setting: ' + regsconfig.subject);

            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });      
        };

        function register() {
            vm.error = null;
            vm.loading = true;

            console.log('register(): ');

            RegisterService.Register(vm)
                .then(function () {
                    $location.path('/register-thanks');
                })
                .catch(function (error) {
                    vm.error = 'Error: ' + error;
                })
                .finally(function () {
                    vm.loading = false;
                });      
        };
    }

})();