(function () {
    'use strict';

    angular
        .module('app')
        .controller('Import.IndexController', Controller);

    function Controller($scope, PageService, UserService, RegistrationService) {
        var vm = this;

        vm.user = null;
        vm.bulkRegister = bulkRegister;
        vm.pages = [];

        $scope.showContent = function($fileContent) {
            $scope.content = $fileContent;
        };

        initController();

        function initController() {
            vm.loading = true;

            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                vm.orgID = user.username;
                vm.eventID = 'default';

                PageService.GetAllEventsByDB(user.username).then(function (pages) {
                    vm.loading = false;
                    vm.pages = pages;
                });
            });
        }

        function bulkRegister() {
            vm.error = null;
            vm.loading = true;
            vm.eventID = vm.selectedEvent.slug;

            $scope.content.split(/\r?\n/).forEach(function(e, i) {
                if (i != 0) {
                    var temp = e.split(/,/);
                    vm.firstname = temp[0];
                    vm.middlename = temp[1];
                    vm.lastname = temp[2];
                    vm.email = temp[3];

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

                }
            });
        }
    }

})();