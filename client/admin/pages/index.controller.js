(function () {
    'use strict';

    angular
        .module('app')
        .controller('Pages.IndexController', Controller);

    function Controller(PageService, UserService) {
        var vm = this;

        vm.user = null;
        vm.pages = [];

        initController();

        function initController() {
            vm.loading = true;

            // Get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;

                PageService.GetAllEventsByDB(user.username).then(function (pages) {
                        vm.loading = false;
                        vm.pages = pages;
                    });

            });

        }
    }

})();