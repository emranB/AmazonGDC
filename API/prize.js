var httpStatus = require('http-status-codes');
Prize = require('../models/Prize');
Attendee = require('../models/Attendee');



/**
 * GET /api//prizes
 * Get a collection of All Prizes 
 **/
var allPrizes = function (req, res) {
    return Prize.getAllPrizes()
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * GET /api//prize/id/:_id
 * Get a single Prize by ID 
 **/
var prizeById = function (req, res) {
    var prizeId = req.params._id;
    if (!prizeId) 
        throw 'Missing Prize Id';  

    return Prize.getPrizeById(prizeId)
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * GET /api//prize/demoId/:title
 * Get a single Prize by Title 
 **/
var prizeByTitle = function (req, res) {
    var title = req.params.title;
    if (!title) 
        throw 'Missing Prize Title';

    return Prize.getPrizeByTitle(title)
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * POST /api//prize
 * Create or Update Prize 
 **/
var savePrizeCreate = function (req, res) {
    var postData = JSON.stringify(req.body);
    if (!postData) 
        throw 'Missing Prize Data';  

    return Prize.postPrizeCreate(postData)
        .then(function (data) {
            res.redirect('/prizes');
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * POST /api/prize/id/:prizeId/attendee/:badgeId/redemptions
 * Create or Update Prize 
 **/
var savePrizeRedemptions = function (req, res) {
    var badgeId = req.params.badgeId;
    var prizeId = req.params.prizeId;
    
    if (!badgeId || !prizeId) 
        throw 'Error: Missing Badge or Prize ID';

    /* Fetch Attendee information */
    var getAttendeeInfo = function () {
        return Attendee.getAttendeeByBadgeId(badgeId)
            .then(function (response) {
                return response;
            });
    };
    
    /* Push Attendee information into the Redemptions field for the specified Prize */
    var updatePrizeRedemptions = function (attendee) {
        var redemptionData = {
            attendee: attendee,
            prizeId: prizeId
        };

        return Prize.postPrizeUpdateRedemptions(redemptionData)
            .then(function (data) {
                res.status(httpStatus.OK).send(data);
            })
            .catch(function (error) {
                res.status(httpStatus.BAD_REQUEST);
                throw error;
            });
    };

    /* Chain promises together in final function call */
    return getAttendeeInfo()
        .then(updatePrizeRedemptions);

};



PrizeExports = {
    allPrizes: allPrizes,
    prizeById: prizeById,
    prizeByTitle: prizeByTitle,
    savePrizeCreate: savePrizeCreate,
    savePrizeRedemptions: savePrizeRedemptions
};

module.exports = PrizeExports;