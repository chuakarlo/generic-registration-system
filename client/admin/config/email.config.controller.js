// Created file and functions to support confirmation email customization - Refer to BitBucket issue #9
(function () {
    'use strict';

    angular
        .module('app')
        .controller('EmailConfig.IndexController', Controller);

    function Controller(PageService, UserService, EmailConfigService) {
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

            EmailConfigService.Retrieve(vm.orgID, vm.eventID).then(function (emailconfig) {
                vm.emailconfig = emailconfig;

                console.log('Email Setting: ' + contconfig.subject);

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

            vm.emailconfig.eventID = vm.eventID;
            vm.emailconfig.orgID = vm.orgID;

            EmailConfigService.Update(vm.emailconfig).then(function () {
  
            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });      
        };

    }

})();