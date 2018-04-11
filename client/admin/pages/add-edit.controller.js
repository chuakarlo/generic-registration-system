(function () {
    'use strict';

    angular
        .module('app')
        .controller('Pages.AddEditController', Controller);

    function Controller($stateParams, $location, $filter, PageService, AlertService, UserService) {
        var vm = this;

        vm.page = {};
        vm.savePage = savePage;
        vm.deletePage = deletePage;

        initController();

        function initController() {
            vm.loading = 0;

            if ($stateParams._id) {
                vm.loading += 1;

                // Get current user
                UserService.GetCurrent().then(function (user) {

                    PageService.GetById($stateParams._id, user.username).then(function (page) {
                        vm.loading -= 1;
                        vm.page = page;
                    });
                });
            } else {
                // initialise with defaults
                vm.page = {
                    publish: true
                };
            }
        }

        function savePage() {

            // Get current user
            UserService.GetCurrent().then(function (user) {

                PageService.Save(vm.page, user.username).then(function () {
                    AlertService.Success('Page saved', true);
                    $location.path('/pages');
                }).catch(function (error) {
                    AlertService.Error(error);
                });
            });
        }

        function deletePage() {

            // Get current user
            UserService.GetCurrent().then(function (user) {

                PageService.Delete(vm.page._id, user.username).then(function () {
                    AlertService.Success('Page deleted', true);
                    $location.path('/pages');
                }).catch(function (error) {
                    AlertService.Error(error);
                });
            });
        }
    }

})();