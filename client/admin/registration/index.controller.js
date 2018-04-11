(function () {
    'use strict';

    angular
        .module('app')
        .controller('Registration.IndexController', Controller);

    function Controller(PageService, UserService, RegistrationService) {
        var vm = this;

        vm.user = null;
        vm.register = register;
        vm.pages = [];

        initController();

        function initController() {
            vm.loading = true;

            // Get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                vm.orgID = user.username;

                PageService.GetAllEventsByDB(user.username).then(function (pages) {
                        vm.loading = false;
                        vm.pages = pages;
                    });
            });

        };

        function register() {
            vm.error = null;
            vm.loading = true;
            vm.eventID = vm.selectedEvent.slug;

            var data = _.omit(vm, 'user');
            data = _.omit(data, 'pages');
            data = _.omit(data, 'selectedEvent');

            RegistrationService.Register(data).then(function () {
                console.log('Registration: done');                
            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });      

        };
    }

})();