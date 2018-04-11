var config = require('config.json');
var express = require('express');
var router = express.Router();
var regService = require('services/register.service');

// routes
router.post('/', saveToDB);
router.get('/all', getFromDBAll);
router.get('/', getFromDB);
router.put('/:_id', updateDB);

module.exports = router;

function saveToDB(req, res) {

    var orgID = req.body.orgID;
    var evtID = req.body.eventID;

    regService.create(req.body).then(function () {
        // Modified url and templateUrl to make the registration form work - Refer to BitBucket issue #43
      	return res.redirect('/register?orgID=' + orgID + '&evtID=' + evtID);
   	}).catch(function (err) {
     	return res.status(400).send(err);
    });
}

// Added function so that a participant's info can be retrieved - Refer to BitBucket issue #27
function getFromDB(req, res) {

	regService.retrieve(req.query).then(function(user) {
      	if(user) {
        	res.send(user);
       	} else {
          	res.sendStatus(404);
       	}
   	}).catch(function (err) {
       	res.status(400).send(err);
  	});
}
//Added function to view participant's list
function getFromDBAll(req, res) {

console.log('entered getFromDBAll');
  regService.retrieveall(req.query).then(function(user) {
        if(user) {
          res.send(user);
        } else {
            res.sendStatus(404);
        }
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

function updateDB(req, res) {

    regService.update(req.params._id, req.body).then(function () {
      	res.sendStatus(200);
   	}).catch(function (err) {
     	res.status(400).send(err);
   	});
}
