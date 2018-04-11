(function () {
    'use strict';

    angular
        .module('app')
        .factory('RegisterService', Service);

    function Service($http, $q) {
        var service = {};

        service.Register = Register;

        return service;

        function Register(form) {

            console.log('Register(form): ');
            
            return $http.post('/api/register', form).then(handleSuccess, handleError);
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
