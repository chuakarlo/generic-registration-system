// Created file and functions to support confirmation email customization - Refer to BitBucket issue #9
(function () {
    'use strict';

    angular
        .module('app')
        .factory('EmailConfigService', Service);

    function Service($http, $q) {
        var service = {};

        service.Retrieve = Retrieve;
        service.Update = Update;

        return service;

        function Retrieve(_orgID, _evtID) {
            return $http.get('/api/emailconfig', {params: {orgID: _orgID, evtID: _evtID}}).then(handleSuccess, handleError);
        }

        function Update(setting) {
            return $http.put('/api/emailconfig/' + setting._id, setting).then(handleSuccess, handleError);
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
