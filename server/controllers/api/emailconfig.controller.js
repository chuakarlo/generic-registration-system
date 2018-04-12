// Created file and functions to support confirmation email customization - Refer to BitBucket issue #9
var config = require('config.json');
var express = require('express');
var router = express.Router();
var emailconfService = require('services/emailconfig.service');

// routes
router.get('/', getEmailConfigFromDB);
router.put('/:_id', updateEmailConfigDB);

module.exports = router;

function getEmailConfigFromDB(req, res) {

  	console.log('getEmailConfigFromDB(): ' + req.query.orgID);

	emailconfService.retrieve(req.query).then(function(user) {
      	if(user) {
        	res.send(user);
       	} else {
          	res.sendStatus(404);
       	}
   	}).catch(function (err) {
       	res.status(400).send(err);
  	});
}

function updateEmailConfigDB(req, res) {

	console.log('updateEmailConfigDB(): ' + req.body.orgID);

    emailconfService.update(req.params._id, req.body).then(function () {
      	res.sendStatus(200);
   	}).catch(function (err) {
     	res.status(400).send(err);
   	});
}
