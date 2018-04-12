// Created file and functions to support contact form customization - Refer to BitBucket issue #35
var config = require('config.json');
var express = require('express');
var router = express.Router();
var contconfService = require('services/contactconfig.service');

// routes
router.get('/', getContactConfigFromDB);
router.put('/:_id', updateContactConfigDB);

module.exports = router;

function getContactConfigFromDB(req, res) {

  console.log('getContactConfigFromDB(): ' + req.query.orgID);

	contconfService.retrieve(req.query).then(function(user) {
      	if(user) {
        	res.send(user);
       	} else {
          	res.sendStatus(404);
       	}
   	}).catch(function (err) {
       	res.status(400).send(err);
  	});
}

function updateContactConfigDB(req, res) {

  console.log('updateContactConfigDB(): ' + req.body.orgID);

    contconfService.update(req.params._id, req.body).then(function () {
        res.sendStatus(200);
    }).catch(function (err) {
      res.status(400).send(err);
    });
}
