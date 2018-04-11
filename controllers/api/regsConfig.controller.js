// Registration config tab content customization API - Refer to BitBucket issue #38
var config = require('config.json');
var express = require('express');
var router = express.Router();
var regsconfService = require('services/regsConfig.service');

// routes
router.get('/', getRegsConfigFromDB);
router.put('/:_id', updateRegsConfigDB);

module.exports = router;

function getRegsConfigFromDB(req, res) {

  	console.log('getRegsConfigFromDB(): ' + req.query.orgID);

	regsconfService.retrieve(req.query).then(function(user) {
      	if(user) {
        	res.send(user);
       	} else {
          	res.sendStatus(404);
       	}
   	}).catch(function (err) {
       	res.status(400).send(err);
  	});
}

function updateRegsConfigDB(req, res) {

  console.log('updateRegsConfigDB(): ' + req.body.orgID);

    regsconfService.update(req.params._id, req.body).then(function () {
      	res.sendStatus(200);
   	}).catch(function (err) {
     	res.status(400).send(err);
   	});
}
