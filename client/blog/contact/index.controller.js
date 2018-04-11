(function () {
    'use strict';

    angular
        .module('app')
        .controller('Contact.IndexController', Controller);

    function Controller($location, ContactService, PublicContactConfigService) {
        var vm = this;

        vm.submit = submit;

        initController();

        function initController() {
            // Make the contact form work - Refer to BitBucket issue #42
            vm.orgID = $location.search().orgID;
            vm.eventID = $location.search().evtID;

            PublicContactConfigService.Retrieve(vm.orgID, vm.eventID).then(function (contconfig) {
                vm.contconfig = contconfig;

                console.log('Config Setting: ' + contconfig.subject);

            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });      

        };

        function submit() {
            vm.error = null;
            vm.loading = true;
            ContactService.Send(vm)
                .then(function () {
                    $location.path('/contact-thanks');
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