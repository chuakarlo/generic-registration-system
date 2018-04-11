// Created file and functions to support contact form customization - Refer to BitBucket issue #35
(function () {
    'use strict';

    angular
        .module('app')
        .controller('ContactConfig.IndexController', Controller);

    function Controller(PageService, UserService, ContactConfigService) {
        var vm = this;

        vm.user = null;
        vm.find = find;
        vm.update = update;
        vm.pages = [];

        initController();

        function initController() {
            vm.loading = true;

            // Get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                vm.orgID = user.username;

                // Retrieve all events for the organizer to select from - Refer to BitBucket issue #26
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

            ContactConfigService.Retrieve(vm.orgID, vm.eventID).then(function (contconfig) {
                vm.contconfig = contconfig;

                console.log('Config Setting: ' + contconfig.subject);

            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });      

        };

        function update() {
            vm.error = null;
            vm.loading = true;    

            vm.contconfig.eventID = vm.eventID;
            vm.contconfig.orgID = vm.orgID;

            ContactConfigService.Update(vm.contconfig).then(function () {
  
            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });      
        };
    }

})();