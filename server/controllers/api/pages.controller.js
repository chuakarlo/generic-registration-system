var config = require('config.json');
var _ = require('lodash');
var express = require('express');
var jwt = require('express-jwt')({ secret: config.secret });
var router = express.Router();
var pageService = require('services/page.service');

// routes
router.get('/', getAllEventsByDB);
router.get('/slug/:slug', getBySlug);
router.get('/:_id', jwt, getById);
router.post('/', jwt, create);
router.put('/:_id', jwt, update);
router.delete('/:_id', jwt, _delete);

module.exports = router;

function getAllEventsByDB(req, res) {

    var username = req.query.username;

    pageService.getAllEventsByDB(username)
        .then(function (pages) {
            // if admin user is logged in return all pages, otherwise return only published pages
            if (req.session.token) {
                res.send(pages);
            } else {
                res.send(_.filter(pages, { 'publish': true }));
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getBySlug(req, res) {
    
    pageService.getBySlug(req.params.slug)
        .then(function (page) {
            // return page if it's published or the admin is logged in
            if (page.publish || req.session.token) {
                res.send(page);
            } else {
                res.status(404).send('Not found');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getById(req, res) {

    var username = req.query.username;

    pageService.getById(req.params._id, username)
        .then(function (page) {
            res.send(page);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function create(req, res) {

    var username = req.query.username;

    pageService.create(req.body, username)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req, res) {

    var username = req.query.username;

    pageService.update(req.params._id, req.body, username)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {

    var username = req.query.username;

    pageService.delete(req.params._id, username)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}