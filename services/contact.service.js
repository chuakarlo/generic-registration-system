// Created file for fix to make contact form work - Refer to BitBucket issue #42
var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
const nodemailer = require('nodemailer');
var db = mongo.db(config.connectionString, { native_parser: true });

var service = {};

service.sendToContact = sendToContact;

module.exports = service;

// Added function so that a participant's info can be retrieved - Refer to BitBucket issue #27
function sendToContact(info) {
    var deferred = Q.defer();
    var collectname = 'settings-' + info.orgID + '-contact';

    db.collection(collectname).findOne({evtID: info.eventID}, function (err, setting) {
        if(err) deferred.reject(err.name + ': ' + err.message);

        if(setting) {
            
            sendEmailToContact(info, setting);
        } 

        deferred.resolve();
    });

    return deferred.promise;
}

function sendEmailToContact(data, setting) {

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
        to: setting.contactemail,
        subject: setting.subject,
        //text: 'Event Confirmation',
        html: 'Hello ' + setting.contactname + ',' +
              '<br><br>Please find my information and inquiry/question/message below.<br><br>Name: ' + data.name + 
              '<br>Email: ' + data.email + '<br>Phone: ' + data.phone + '<br>Subject: ' + data.subject + 
              '<br>Message: ' + data.message +
              '<br><br>Thank you!<br><i>' + data.name +'</i></html>',
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            return console.log(error);
        }
        
        console.log('Message %s sent: %s', info.messageId, info.response);
      
        transporter.close();
    });
}

