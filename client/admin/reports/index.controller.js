(function () {
    'use strict';

    angular
        .module('app')
        .controller('Reports.IndexController', Controller);

    function Controller(PageService, UserService, RegistrationService) {
        var vm = this;

        vm.user = null;
        vm.pages = [];
        vm.parts = [];
        vm.certall = [];
        vm.showlist = showlist;
        vm.generateattendance = generateattendance;
        vm.downloadlist = downloadlist;
        vm.downloadattendance = downloadattendance;
        vm.generatecert = generatecert;
        vm.generateallcert = generateallcert;

        initController();

        function initController() {
            vm.loading = true;
            vm.chosendate = new Date();
            // Get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                vm.orgID = user.username;
                vm.eventID = 'default';

                PageService.GetAllEventsByDB(user.username).then(function (pages) {
                        vm.loading = false;
                        vm.pages = pages;
                    });
            });
        };
        function showlist(){
            vm.error = null;
            vm.loading = true;            
            vm.eventID = vm.selectedEvent.slug;

            console.log('entered showlist ' + vm.orgID + ' ' + vm.eventID); 
            
            RegistrationService.RetrieveAll(vm.orgID, vm.eventID).then(function (parts) {
                vm.parts = parts;
            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });  
        };

        function generateattendance(){
            vm.error = null;
            vm.loading = true;            
            vm.eventID = vm.selectedEvent.slug;
            vm.getattend = [];

            vm.datesearch = vm.chosendate.toLocaleDateString();

            //console.log('entered showlist ' + vm.orgID + ' ' + vm.eventID + vm.datesearch.toString()); 
            
            RegistrationService.RetrieveAll(vm.orgID, vm.eventID).then(function (parts) {
                vm.parts = parts;

                if(vm.parts.length)
                {         
                    //console.log('ENTERED IF : length of parts' + vm.parts.length + ' contents of parts ' + vm.parts);       
                    for (var i = vm.parts.length - 1; i >= 0; i--) {
                        if(vm.parts[i].attendance)
                        {
                            //console.log('iLOOP parts[' + i +'].attendance' + vm.parts[i].attendance);

                            for (var j = vm.parts[i].attendance.length - 1; j >= 0; j--) {
                                //console.log('jLOOP parts[' + i +'].attendance' + '[' + j + ']' + vm.parts[i].attendance[j]);

                                if(vm.parts[i].attendance[j].day.date == vm.datesearch.toString())
                                {
                                    //console.log('FOUND ' + vm.parts[i].attendance[j].day.date + ' checkin: ' + vm.parts[i].attendance[j].day.checkin);
                                    //console.log('check getattend ' + vm.getattend.indexOf(vm.parts[i]));
                                    
                                    if(vm.getattend.indexOf(vm.parts[i]) === -1)
                                    {
                                        vm.parts[i].checkinshow = vm.parts[i].attendance[j].day.checkin;
                                        vm.parts[i].checkoutshow = vm.parts[i].attendance[j].day.checkout;
                                        vm.getattend.push(vm.parts[i]);
                                    } 
                                }
                            }
                        }
                    }
                }
                vm.parts = null;
            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });  
        };

        function downloadlist(){
            
            var blob = new Blob([document.getElementById('exportlist').innerHTML], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
            });
            saveAs(blob, "List of Participants - "+ vm.orgID + ' ' + vm.eventID + ".xls");

        };

        function downloadattendance()
        {
            var blob = new Blob([document.getElementById('exportattendance').innerHTML], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
            });
            saveAs(blob, "Attendance "+ vm.chosendate.toLocaleDateString() + ' - '+ vm.orgID + ' ' + vm.eventID +  ".xls");
        }

        function generatecert(){

            var lMargin=15; //left margin in mm
            var rMargin=15; //right margin in mm
            var pdfInMM=297;  // width of A4 in mm for landscape
            var pageCenter=pdfInMM/2;

            var doc = new jsPDF("l","mm","a4");
            doc.setFontSize(50);

            var lines =doc.splitTextToSize(vm.particpantname, (pdfInMM-lMargin-rMargin));
            var dim = doc.getTextDimensions('Text');
            var lineHeight = dim.h
            for(var i=0;i<lines.length;i++){
              var lineTop = (lineHeight/2)*i;
              doc.text(lines[i],pageCenter,90+lineTop,'center'); //see this line
            }
            doc.save('Certificate of ' + vm.particpantname + '.pdf');

            console.log('pdf generated for ' + vm.particpantname);
        }

        function generateallcert(){
            // pdf init variables
            var lMargin=15; //left margin in mm
            var rMargin=15; //right margin in mm
            var pdfInMM=297;  // width of A4 in mm for landscape
            var pageCenter=pdfInMM/2;

            var doc = new jsPDF("l","mm","a4");
            doc.setFontSize(50);
            //scope variables
            vm.error = null;
            vm.loading = true;            
            vm.eventID = vm.selectedEvent.slug;

            console.log('entered generateallcert ' + vm.orgID + ' ' + vm.eventID); 
            
            //fetching data from mongodb
            RegistrationService.RetrieveAll(vm.orgID, vm.eventID).then(function (certall) {
                vm.certall = certall;
                //generating the pdf
                if(vm.certall){
                    for (var i = vm.certall.length - 1; i >= 0; i--) {
                        var nametoprint = "";
                        if(vm.certall[i].firstname){
                            nametoprint = vm.certall[i].firstname + ' ';
                        }
                        if(vm.certall[i].middlename){
                            nametoprint = nametoprint + vm.certall[i].middlename + '. ';
                        }
                        if(vm.certall[i].lastname){
                            nametoprint = nametoprint + vm.certall[i].lastname + ' ';
                        }
                        if(vm.certall[i].suffix){
                            nametoprint = nametoprint + vm.certall[i].suffix;
                        }
                        
                        var lines =doc.splitTextToSize(nametoprint, (pdfInMM-lMargin-rMargin));
                        var dim = doc.getTextDimensions('Text');
                        var lineHeight = dim.h
                        for(var j=0;j<lines.length;j++){
                          var lineTop = (lineHeight/2)*j;
                          doc.text(lines[j],pageCenter,90+lineTop,'center'); //see this line
                        }
                        if(i>0){
                            doc.addPage();
                        }
                    }

                    doc.save('Certificates ' + vm.orgID + ' ' + vm.eventID + '.pdf');
                    console.log('generated  Certificates for '  + vm.orgID + ' ' + vm.eventID);
                }
            }).catch(function (error) {
                vm.error = 'Error: ' + error;
            })
            .finally(function () {
                vm.loading = false;
            });  
            
        }
    }

})();