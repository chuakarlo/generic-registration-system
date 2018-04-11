var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var qrImage = require('qr-image');
var fs = require('fs');
const nodemailer = require('nodemailer');
var db = mongo.db(config.connectionString, { native_parser: true });

var service = {};

service.create = create;
service.retrieve = retrieve;
service.update = update;
service.retrieveall = retrieveall;

module.exports = service;

function create(userParam) {
    var deferred = Q.defer();
    var userevent = 'event-' + userParam.orgID + '-' + userParam.eventID;
    var emailsetting = 'settings-' + userParam.orgID + '-email';

    // Create the QR code for the participant - Refer to BitBucket issue #12
    createQRCode(userParam);

    // validation
    db.collection(userevent).findOne({firstname: userParam.firstname}, function (err, user) {
        if(err) deferred.reject(err.name + ': ' + err.message);

        if(user) {
            // username already exists
            deferred.reject('Name: "' + userParam.name + '" is already registered');
        } else {
            createUser();
        }
    });


    function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'loading');
        user = _.omit(user, 'error');
        user = _.omit(user, 'orgID');
        user = _.omit(user, 'eventID');

        db.collection(userevent).insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                //deferred.resolve();

                if(user.email) {

                    db.collection(emailsetting).findOne({evtID: userParam.eventID}, function (err, setting) {
                        if(err) deferred.reject(err.name + ': ' + err.message);

                        if(setting) {
                            
                            // Send confirmation email after participant registration - Refer to BitBucket issue #11
                            sendConfirmEmail(user, setting);

                            // return setting
                            deferred.resolve();
                        } else {
                            // user not found
                            deferred.resolve();
                        }
                    });
                }
            });
    }

    return deferred.promise;
}

// Added function so generate a participant's QR code - Refer to BitBucket issue #12
function createQRCode(user) {

    var info = 'lastname: ' + user.lastname + ', firstname: ' + user.firstname + ', evtID: ' + user.eventID;

    qrImage.image(info, {type:'png', size: 7})
        .pipe(fs.createWriteStream("services/evtQRCode.png"));
}

// Added function to send confirmation email after participant registration - Refer to BitBucket issue #11
function sendConfirmEmail(user, setting) {

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'ecregsystem@gmail.com',
            pass: 'regsec^Plat18'
        }
    });

    let mailOptions = {
        from: '"ECReg System" <ecregsystem@gmail.com>',
        to: user.email,
        subject: setting.subject,
        //text: 'Event Confirmation',
        //html: setting.salutation + ' ' + user.firstname + ' ' + user.lastname + ',' +
        //      '<br><br>Thank you for registering with our event.<br><img src="cid:ecregsystem@gmail.com"/><br><br>Please present this confirmation email upon checking-in at the event.<br><br>' + 
        //      setting.valediction + ',<br><i>' + setting.signature + '</i></html>',
        html: '<html><head><style>div.border{border-style:dashed;border-width:2px;width:570px;position:relative;}</style>' +
            '<style>img.logo{opacity:0.1;}</style><style>#part_name{position:absolute;font-size:24px;' +
            'font-weight:bold;left:300px;top:50px;}</style><style>#part_title{position:absolute;' +
            'font-size:16px;font-weight:bold;left:300px;top:85px;}</style><style>#part_event{' + 
            'position:absolute;font-size:20px;font-weight:bold;left:300px;top:170px;}</style></head>' + 
            setting.salutation + ' ' + user.firstname + ' ' + user.lastname + ',' + 
            '<br><br>Thank you for registering with our event.<br><br><div class="border">' +
            '<img align="middle" src="cid:qr.ecregsystem@gmail.com"/>' +
            '<img class="logo" align="middle" src="cid:logo.ecregsystem@gmail.com"/><p id="part_name">' + 
            user.firstname + ' ' + user.lastname + '</p><p id="part_title">' + user.jobtitle + '</p><p id="part_event">' + 
            setting.evttitle + '</p></div><br><br>Please present this confirmation email upon checking in at the event.  ' +
            'The above image serves as your event ID.<br><br>' + setting.valediction + ',<br><i>' + setting.signature + 
            '</i></html>',
        attachments: [{
            filename: 'evtQRCode.png',
            path: __dirname + '/evtQRCode.png',
            cid: 'qr.ecregsystem@gmail.com' //same cid value as in the html img src
        },
        {
            filename: 'evtLogo.png',
            path: __dirname + '/evtLogo.png',
            cid: 'logo.ecregsystem@gmail.com' //same cid value as in the html img src
        }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            return console.log(error);
        }
        
        console.log('Message %s sent: %s', info.messageId, info.response);
      
        transporter.close();
    });
}

// Added function so that a participant's info can be retrieved - Refer to BitBucket issue #27
function retrieve(info) {
    var deferred = Q.defer();
    var userevent = 'event-' + info.orgID + '-' + info.evtID;

    // Check first if the user entered a valid username and password - Refer to BitBucket issue #32
    if((!info.firstname) && (!info.lastname)) {
        deferred.reject('No name specified.');
    }
    else if(!info.firstname) {
        db.collection(userevent).find({lastname: info.lastname}).toArray(function (err, user) {
            if(err) deferred.reject(err.name + ': ' + err.message);

            if(user) {
                deferred.resolve(user);
            } else {
                // user not found
                deferred.resolve();
            }
        });
    }
    else if(!info.lastname) {
        db.collection(userevent).find({firstname: info.firstname}).toArray(function (err, user) {
            if(err) deferred.reject(err.name + ': ' + err.message);

            if(user) {
                deferred.resolve(user);
            } else {
                // user not found
                deferred.resolve();
            }
        });
    }
    else {
        db.collection(userevent).find({firstname: info.firstname, lastname: info.lastname}).toArray(function (err, user) {
            if(err) deferred.reject(err.name + ': ' + err.message);

            if(user) {
                deferred.resolve(user);
            } else {
                // user not found
                deferred.resolve();
            }
        });
    }

    return deferred.promise;
}

//Added function to view participant's list
function retrieveall(info) {
    var deferred = Q.defer();
    var userevent = 'event-' + info.orgID + '-' + info.evtID;

    console.log('retrieveall(): ' + userevent);

    db.collection(userevent).find().toArray(function (err, user) {
        if(err) deferred.reject(err.name + ': ' + err.message);

        if(user) {
            console.log(user);
            // return user (without hashed password)
            
            deferred.resolve(user);

        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function update(_id, userParam) {
    var userevent = 'event-' + userParam.orgID + '-' + userParam.eventID;
    var deferred = Q.defer();

    var set = _.omit(userParam, '_id');
    set = _.omit(set, 'orgID');
    set = _.omit(set, 'eventID');

    db.collection(userevent).update({ _id: mongo.helper.toObjectID(_id)}, {$set: set}, function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve();
    });

    return deferred.promise;
}
