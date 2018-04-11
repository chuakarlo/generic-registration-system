(function () {
    'use strict';

    angular
        .module('app')
        .factory('PageService', Service);

    function Service($http, $q) {
      	var service = {};

        service.GetAllEventsByDB = GetAllEventsByDB;
        service.GetById = GetById;
        service.Save = Save;
        service.Delete = Delete;

        return service;

        function GetAllEventsByDB(_username) {
            return $http.get('/api/pages', {params: {username: _username}}).then(handleSuccess, handleError);
        }

        function GetById(id, _username) {
            return $http.get('/api/pages/' + id, {params: {username: _username}}).then(handleSuccess, handleError);
        }

        function Save(entity, _username) {
            if (entity._id) {
                // update
                return $http.put('/api/pages/' + entity._id, entity, {params: {username: _username}}).then(handleSuccess, handleError);
            } else {
                // create
                return $http.post('/api/pages', entity, {params: {username: _username}}).then(handleSuccess, handleError);
            }
        }

        function Delete(id, _username) {
            return $http.delete('/api/pages/' + id, {params: {username: _username}}).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data && res.data.Message);
        }
    }
})();
