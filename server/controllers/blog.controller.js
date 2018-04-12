var express = require('express');
var _ = require('lodash');
var moment = require('moment');
var path = require('path');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var config = require('config.json');
var pageService = require('services/page.service');
var userService = require('services/user.service');
var slugify = require('helpers/slugify');
var pager = require('helpers/pager');

var basePath = path.resolve('../client/blog');
var indexPath = basePath + '/index';
var metaTitleSuffix = " | ECRegS Platform";
var oneWeekSeconds = 60 * 60 * 24 * 7;
var oneWeekMilliseconds = oneWeekSeconds * 1000;

/* STATIC ROUTES
---------------------------------------*/

router.use('/_dist', express.static(basePath + '/_dist'));
router.use('/_content', express.static(basePath + '/_content', { maxAge: oneWeekMilliseconds }));

/* MIDDLEWARE
---------------------------------------*/

// add shared data to vm
router.use(function (req, res, next) {
    var vm = req.vm = {};

    vm.loggedIn = !!req.session.token;
    vm.domain = req.protocol + '://' + req.get('host');
    vm.url = vm.domain + req.path;
    vm.googleAnalyticsAccount = config.googleAnalyticsAccount;

    pageService.getBySlug('default').then(function (page) {
        next();
    
    }).catch(function (err) {
        vm.error = err;
        res.render(indexPath, vm);
    });       
});

/* ROUTES
---------------------------------------*/
router.get('/', function (req, res) {
    // log user out
    delete req.session.token;

    // move success message into local variable so it only appears once (single read)
    var viewData = { success: req.session.success };
    delete req.session.success;

    res.render('login/index', viewData);
});

router.post('/', function (req, res) {
    userService.authenticate(req.body.username, req.body.password)
        .then(function (token) {
            // authentication is successful if the token parameter has a value
            if (token) {
                // save JWT token in the session to make it available to the angular app
                req.session.token = token;

                // redirect to returnUrl
                var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/admin';
                return res.redirect(returnUrl);
            } else {
                return res.render('login/index', { error: 'Username or password is incorrect', username: req.body.username });
            }
        })
        .catch(function (err) {
            console.log('error on login', err);
            return res.render('login/index', { error: err });
        });
});

/*
// home route
router.get('/', function (req, res, next) {
    
    var vm = req.vm;

    pageService.getBySlug('default').then(function (page) {
            
        if (!page)
        { 
            return render('home/empty.html', req, res);
        }
            
        vm.page = page;
        // LEO vm.name = 'leob';

        // meta tags
        vm.metaTitle = vm.page.title + metaTitleSuffix;
        vm.metaDescription = vm.page.description + metaTitleSuffix;

        render('pages/details.view.html', req, res);
        
    }).catch(function (err) {
        vm.error = err;
        res.render(indexPath, vm);
    });

});
*/

// page details route
router.get('/page/:slug', function (req, res, next) {
    var vm = req.vm;

    pageService.getBySlug(req.params.slug)
        .then(function (page) {
            if (!page) return res.status(404).send('Not found');

            vm.page = page;

            // meta tags
            vm.metaTitle = vm.page.title + metaTitleSuffix;
            vm.metaDescription = vm.page.description + metaTitleSuffix;

            render('pages/details.view.html', req, res);
        })
        .catch(function (err) {
            vm.error = err;
            res.render(indexPath, vm);
        });
});

// register route
/*
router.get('/register/:orgname/:eventID', function (req, res, next) {
    var vm = req.vm;

    // meta tags
    vm.metaTitle = 'Register Me' + metaTitleSuffix;
    vm.metaOwner = req.params.orgname;
    vm.metaID = req.params.eventID;
    vm.metaDescription = 'Register Me' + metaTitleSuffix;

    render('register/index.view.html', req, res);
});
*/

// register route - Refer to BitBucket issue #7
router.get('/register', function (req, res, next) {
    var vm = req.vm;
    var orgID = req.query.orgID;
    var evtID = req.query.evtID;

    console.log('Route Org: ' + req.query.orgID);

    // meta tags
    vm.metaTitle = 'Registration';
    vm.metaOwner = orgID;
    vm.orgID = orgID;
    vm.metaID = evtID;
    vm.eventID = evtID;
    vm.metaDescription = 'Registration';

    render('register/index.view.html', req, res);
});

// register thanks route - Refer to BitBucket issue #7
router.get('/register-thanks', function (req, res, next) {
    var vm = req.vm;

    // meta tags
    vm.metaTitle = 'Registration';
    vm.metaDescription = 'Registration';

    render('register/thanks.view.html', req, res);
});

// contact route
router.get('/contact', function (req, res, next) {
    var vm = req.vm;
    var orgID = req.query.orgID;
    var evtID = req.query.evtID;

    console.log('Contact Org: ' + orgID + ':' + evtID);

    // meta tags
    vm.metaTitle = 'Contact Me: ' + orgID + ':' + evtID;
    vm.metaOwner = orgID;
    vm.orgID = orgID;
    vm.metaID = evtID;
    vm.eventID = evtID;
    vm.metaDescription = 'Contact Me: ' + orgID + ':' + evtID;

    render('contact/index.view.html', req, res);
});

// contact thanks route
router.get('/contact-thanks', function (req, res, next) {
    var vm = req.vm;

    // meta tags
    vm.metaTitle = 'Contact Me' + metaTitleSuffix;
    vm.metaDescription = 'Contact Me' + metaTitleSuffix;

    render('contact/thanks.view.html', req, res);
});

router.get('/:orgname/:eventname', function (req, res, next) {
    //console.log(req.params.orgname + ': ' + req.params.eventname);
    var vm = req.vm;

    pageService.getEventPage(req.params.orgname, req.params.eventname).then(function (page) {
        if (!page) 
            return res.status(404).send('Not found');

        vm.page = page;

        // meta tags
        vm.metaTitle = vm.page.title;
        vm.metaOwner = vm.page.org;
        vm.metaID = vm.page.slug;
        vm.metaDescription = vm.page.description + metaTitleSuffix;

        render('pages/details.view.html', req, res);
    }).catch(function (err) {
        vm.error = err;
        res.render(indexPath, vm);
    });
});

/* PROXY ROUTES
---------------------------------------*/

// google analytics
router.get('/analytics.js', function (req, res, next) {
    proxy('http://www.google-analytics.com/analytics.js', basePath + '/_content/analytics.js', req, res);
});

module.exports = router;

/* PRIVATE HELPER FUNCTIONS
---------------------------------------*/

// render template
function render(templateUrl, req, res) {
    var vm = req.vm;

    vm.xhr = req.xhr;
    vm.templateUrl = templateUrl;

    // render view only for ajax request or whole page for full request
    var renderPath = req.xhr ? basePath + '/' + vm.templateUrl : indexPath;
    return res.render(renderPath, vm);
}

// proxy file from remote url for page speed score
function proxy(fileUrl, filePath, req, res) {
    // ensure file exists and is less than 1 hour old
    fs.stat(filePath, function (err, stats) {
        if (err) {
            // file doesn't exist so download and create it
            updateFileAndReturn();
        } else {
            // file exists so ensure it's not stale
            if (moment().diff(stats.mtime, 'minutes') > 60) {
                updateFileAndReturn();
            } else {
                returnFile();
            }
        }
    });

    // update file from remote url then send to client
    function updateFileAndReturn() {
        request(fileUrl, function (error, response, body) {
            fs.writeFileSync(filePath, body);
            returnFile();
        });
    }

    // send file to client
    function returnFile() {
        res.set('Cache-Control', 'public, max-age=' + oneWeekSeconds);
        res.sendFile(filePath);
    }
}