// Created file and functions to support confirmation email customization - Refer to BitBucket issue #9
var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');

var db = mongo.db(config.connectionString, { native_parser: true });

var service = {};

service.retrieve = retrieve;
service.update = update;

module.exports = service;

function retrieve(info) {
    var deferred = Q.defer();
    var collectname = 'settings-' + info.orgID + '-email'; 
    
    console.log('Email retrieve(): ' + info.evtID);

    db.collection(collectname).findOne({evtID: info.evtID}, function (err, setting) {
        if(err) deferred.reject(err.name + ': ' + err.message);

        if(setting) {
            // return setting
            deferred.resolve(setting);
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}


function update(_id, configParam) {
    var collectname = 'settings-' + configParam.orgID + '-email';
    var deferred = Q.defer();

    var set = _.omit(configParam, '_id');
    set = _.omit(set, 'orgID');
    set = _.omit(set, 'eventID');

    console.log('Email update(): ' + collectname);

    db.collection(collectname).update({ _id: mongo.helper.toObjectID(_id)}, {$set: set}, function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve();
    });

    return deferred.promise;
}
