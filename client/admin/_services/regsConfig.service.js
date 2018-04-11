// Registration config tab content customization API - Refer to BitBucket issue #38
(function () {
    'use strict';

    angular
        .module('app')
        .factory('RegistrationConfigService', Service);

    function Service($http, $q) {
        var service = {};

        service.Retrieve = Retrieve;
        service.Update = Update;

        return service;

        function Retrieve(_orgID, _evtID) {
            return $http.get('/api/regsConfig', {params: {orgID: _orgID, evtID: _evtID}}).then(handleSuccess, handleError);
        }

        function Update(setting) {
            return $http.put('/api/regsConfig/' + setting._id, setting).then(handleSuccess, handleError);
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
