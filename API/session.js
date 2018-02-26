var httpStatus = require('http-status-codes');
var cookieParser = require('cookie-parser');
var session = require('express-session');
Session = require('../models/Session');



/**
 * POST /api/session/authorize/rfid
 * Create a New Session for a User using RFID values
 **/
var authorizeUserByRfid = function (req, res) {
    return Session.authorizeRfid(req.body)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};


/**
 * POST /api/session
 * Create a New Session for a user
 **/
var authorizeUser = function (req, res) {
    return Session.authorizeUser(req.body)
        .then(function (data) {
            if (data) {
                req.session.user = data;
                res.redirect('/home');
            } else {
                res.send("Could not find username or password");
            }
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};


/**
 * GET /api/session
 * Get User in current session
 **/
var getSession = function (req, res) {
    res.send(req.session.user);
};


/**
 * GET /api/logout
 * Get User in current session
 **/
var destroySession = function (req, res) {
    req.session.user = false;
    req.session.destroy();
    res.redirect('/login');
};


SessionExports = {
    authorizeUser: authorizeUser,
    authorizeUserByRfid: authorizeUserByRfid,
    getSession: getSession,
    destroySession: destroySession
};

module.exports = SessionExports;