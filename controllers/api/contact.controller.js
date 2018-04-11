var config = require('config.json');
var nodemailer = require('nodemailer');
var express = require('express');
var router = express.Router();
var contactService = require('services/contact.service');

// routes
router.post('/', send);

module.exports = router;

// Modified function the contact form work - Refer to BitBucket issue #42
function send(req, res) {
    console.log('Sending email to contact');

    var orgID = req.body.orgID;
    var evtID = req.body.eventID;

    contactService.sendToContact(req.body).then(function () {
        return res.redirect('/contact?orgID=' + orgID + '&evtID=' + evtID);
    }).catch(function (err) {
        return res.status(400).send(err);
    });
}
