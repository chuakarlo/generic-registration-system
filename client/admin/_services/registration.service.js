(function () {
    'use strict';

    angular
        .module('app')
        .factory('RegistrationService', Service);

    function Service($http, $q) {
        var service = {};

        service.Register = Register;
        // Added function so that a participant's info can be retrieved - Refer to BitBucket issue #27
        service.Retrieve = Retrieve;
        service.Update = Update;
        // Added function to view participant's list
        service.RetrieveAll = RetrieveAll;

        return service;

        function Register(form) {
            return $http.post('/api/register', form).then(handleSuccess, handleError);
        }

        // Added function so that a participant's info can be retrieved - Refer to BitBucket issue #27
        function Retrieve(fname, lname, _orgID, _evtID) {
            return $http.get('/api/register', {params: {firstname: fname, lastname: lname, orgID: _orgID, evtID: _evtID}}).then(handleSuccess, handleError);
        }
        // Added function to view participant's list
        function RetrieveAll(_orgID, _evtID) {
            console.log('Entered RetrieveAll');
            return $http.get('/api/register/all', {params: {orgID: _orgID, evtID: _evtID}}).then(handleSuccess, handleError);
        }

        function Update(user) {
            return $http.put('/api/register/' + user._id, user).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();
