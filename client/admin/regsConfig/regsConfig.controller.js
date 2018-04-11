// Registration config tab content customization API - Refer to BitBucket issue #38
(function () {
    'use strict';

    angular
        .module('app')
        .controller('RegsConfig.IndexController', Controller);

    function Controller(PageService, UserService, RegistrationConfigService) {
        var vm = this;

        vm.user = null;
        vm.find = find;
        vm.save = save;
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


        function find() {
            vm.error = null;
            vm.loading = true;            
            vm.eventID = vm.selectedEvent.slug;

            console.log('find()');    

            var data = _.omit(vm, 'user');
            data = _.omit(data, 'pages');
            data = _.omit(data, 'selectedEvent');

            RegistrationConfigService.Retrieve(vm.orgID, vm.eventID).then(function (regsconfig) {
                vm.regsconfig = regsconfig;

                console.log('Config Setting: ' + regsconfig.showTitle);

            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });      
        };

        function save() {
            vm.error = null;
            vm.loading = true;    

            console.log('save activate');

            vm.regsconfig.eventID = vm.eventID;
            vm.regsconfig.orgID = vm.orgID;

            RegistrationConfigService.Update(vm.regsconfig).then(function () {
  
            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });      
        };

    }

})();