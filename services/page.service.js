var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var slugify = require('helpers/slugify');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('pages');

var service = {};

service.getAllEventsByDB = getAllEventsByDB;
service.getBySlug = getBySlug;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
// Added API for participant registration - Refer to BitBucket issue #7
service.getEventPage = getEventPage;

module.exports = service;

function getAllEventsByDB(username) {
    var deferred = Q.defer();

    var userevents = 'events-' + username;     
//    console.log('getAll(username): ' + userevents);

    db.collection(userevents).find().toArray(function (err, pages) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        pages = _.sortBy(pages, function (p) { return p.title.toLowerCase(); });

        deferred.resolve(pages);
    });


    return deferred.promise;
}

function getBySlug(slug) {
    var deferred = Q.defer();

    db.collection('events-admin').findOne({
        slug: slug
    }, function (err, page) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(page);
    });

    return deferred.promise;
}

// Added API for participant registration - Refer to BitBucket issue #7
function getEventPage(username, slug) {
    var deferred = Q.defer();

    console.log('getEventPage(): ' + username + ': ' + slug);

    db.collection('events-' + username).findOne({
        slug: slug
    }, function (err, page) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(page);
    });

    return deferred.promise;    
}

function getById(_id, username) {
    var deferred = Q.defer();

    var userevents = 'events-' + username;

    db.collection(userevents).findById(_id, function (err, page) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(page);
    });

    return deferred.promise;
}

function create(pageParam, username) {
    var deferred = Q.defer();

    var userevents = 'events-' + username;
    var contactsetting = 'settings-' + username + '-contact';
    var emailsetting = 'settings-' + username + '-email';
    var regssetting = 'settings-' + username + '-registration';
    var contactset = {
        evtID: pageParam.slug,
        contactemail: 'event@domain.com',
        contactname: 'John Doe',
        subject: 'Event Inquiry/Question/Message',
        showsubject: true,
        showphone: true
    };
    var emailset = {
        evtID: pageParam.slug,
        evttitle: pageParam.title,
        evtaddress: pageParam.address,
        subject: 'Confirmation of Registration for ' + pageParam.title,
        salutation: 'Hello',
        valediction: 'Thank You',
        signature: pageParam.title + ' Organizing Committee'
    };
    var regsset = {
        evtID: pageParam.slug,
        showTitle: false,
        showMiddleName: false,
        showSuffix: false,
        showGender: false,
        showAge: false,
        showJobTitle: false,
        showPhone: false,
        showNationality: false,
        showAddress: false,
        showCity: false,
        showProvince: false,
        showCountry: false,
        showZipCode: false,
        showAllergies: false,
        showQuestions: false
    };


    // generate slug from title if empty
    pageParam.slug = pageParam.slug || slugify(pageParam.title);
    pageParam.org = username;

    db.collection(userevents).insert(pageParam, function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve();
    });

    db.collection(contactsetting).insert(contactset, function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve();
    });

    db.collection(emailsetting).insert(emailset, function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve();
    });
    db.collection(regssetting).insert(regsset, function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve();
    });

    return deferred.promise;
}

function update(_id, pageParam, username) {
    var deferred = Q.defer();

    var userevents = 'events-' + username;

    // generate slug from title if empty
    pageParam.slug = pageParam.slug || slugify(pageParam.title);
    pageParam.org = username;

    // fields to update
    var set = _.omit(pageParam, '_id');

    db.collection(userevents).update(
        { _id: mongo.helper.toObjectID(_id) },
        { $set: set },
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function _delete(_id, username) {
    var deferred = Q.defer();

    var userevents = 'events-' + username;

    db.collection(userevents).remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}