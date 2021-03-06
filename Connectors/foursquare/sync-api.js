/*
*
* Copyright (C) 2011, The Locker Project
* All rights reserved.
*
* Please see the LICENSE file for more information.
*
*/

var fs = require('fs'),
    sync = require('./sync'),
    locker = require('../../Common/node/locker.js');
    
var app, auth;

module.exports = function(theapp) {
    app = theapp;
    app.get('/', index);
    this.authComplete = authComplete;
    return this;
}

function authComplete(theauth, mongoCollections) {
    auth = theauth;
    sync.init(auth, mongoCollections);

    app.get('/friends', friends);
    app.get('/checkins', checkins);
    
    sync.eventEmitter.on('checkin/foursquare', function(eventObj) {
        locker.event('checkin/foursquare', eventObj);
    });
    sync.eventEmitter.on('contact/foursquare', function(eventObj) {
        locker.event('contact/foursquare', eventObj);
    });
}

function index(req, res) {
    if(!(auth && auth.accessToken))
        res.redirect(app.meData.uri + 'go');
    else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end("<html>found a token, load <a href='friends'>friends</a> or <a href='checkins'>checkins</a></html>");
    }
}

function friends(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    sync.syncFriends(function(err, repeatAfter, diaryEntry) {
        locker.diary(diaryEntry);
        locker.at('/friends', repeatAfter);
        res.end(JSON.stringify({success: "done fetching friends"}));
    });
}


function checkins(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    sync.syncCheckins(function(err, repeatAfter, diaryEntry) {
        locker.diary(diaryEntry);
        locker.at('/checkins', repeatAfter);
        res.end(JSON.stringify({success: "done fetching checkins"}));
    });
}