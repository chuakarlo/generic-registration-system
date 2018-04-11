(function () {
    'use strict';

    angular
        .module('app')
        .controller('CheckIn.IndexController', Controller);

    function Controller(PageService, UserService, RegistrationService) {
        var vm = this;

        vm.user = null;
        vm.find = find;
        vm.checkinfromlist = checkinfromlist;
        vm.checkoutfromlist = checkoutfromlist;
        vm.checkin = checkin;
        vm.checkout = checkout;
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

            console.log('find(): ' + vm.firstname + ' ' + vm.lastname);    

            var data = _.omit(vm, 'user');
            data = _.omit(data, 'pages');
            data = _.omit(data, 'selectedEvent');

            RegistrationService.Retrieve(vm.firstname, vm.lastname, vm.orgID, vm.eventID).then(function (regsinfo) {
                vm.regsinfo = regsinfo;

            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });      

        };

        function checkinfromlist(regsinfo) {
            var today = new Date();
            var currdate = today.toLocaleDateString();
            var currtime = today.toLocaleTimeString();

            vm.error = null;
            vm.loading = true;    

            if(regsinfo.attendance)
            {
                var day = {day: {date: currdate, checkin: currtime}};

                regsinfo.attendance.push(day);
            }
            else
            {
                var day = {day: {date: currdate, checkin: currtime}};
                regsinfo.attendance = [];

                regsinfo.attendance.push(day);
            }

            console.log('Check-in done.');  

            regsinfo.eventID = vm.eventID;
            regsinfo.orgID = vm.orgID;

            RegistrationService.Update(regsinfo).then(function () {
  
            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });                  
        };

        function checkoutfromlist(regsinfo) {
            var today = new Date();
            var currdate = today.toLocaleDateString();
            var currtime = today.toLocaleTimeString();

            vm.error = null;
            vm.loading = true;    

            var size = regsinfo.attendance.length - 1;
            regsinfo.attendance[size].day.checkout = currtime;            

            console.log('Check-out done.');  

            regsinfo.eventID = vm.eventID;
            regsinfo.orgID = vm.orgID;

            RegistrationService.Update(regsinfo).then(function () {
  
            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });   
        };


        function checkin() {
            var today = new Date();
            var currdate = today.toLocaleDateString();
            var currtime = today.toLocaleTimeString();

            vm.error = null;
            vm.loading = true;    

            if(vm.regsinfo.attendance)
            {
                var day = {day: {date: currdate, checkin: currtime}};

                vm.regsinfo.attendance.push(day);
            }
            else
            {
                var day = {day: {date: currdate, checkin: currtime}};
                vm.regsinfo.attendance = [];

                vm.regsinfo.attendance.push(day);
            }

            console.log('Check-in done.');  

            vm.regsinfo.eventID = vm.eventID;
            vm.regsinfo.orgID = vm.orgID;

            RegistrationService.Update(vm.regsinfo).then(function () {
  
            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });      
        };

        function checkout() {
            var today = new Date();
            var currdate = today.toLocaleDateString();
            var currtime = today.toLocaleTimeString();

            vm.error = null;
            vm.loading = true;    

            var size = vm.regsinfo.attendance.length - 1;
            vm.regsinfo.attendance[size].day.checkout = currtime;            

            console.log('Check-out done.');  

            vm.regsinfo.eventID = vm.eventID;
            vm.regsinfo.orgID = vm.orgID;

            RegistrationService.Update(vm.regsinfo).then(function () {
  
            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });   
        };
    }

})();