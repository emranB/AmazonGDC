/**
 * Connection
 **/
var mongoose = require('mongoose');
var uri = 'mongodb://localhost:27017/amazon_gdc';
var connection = mongoose.connect(uri);


/**
 * Define Schema
 **/
var Schema = mongoose.Schema;
var id = mongoose.Types.ObjectId();
var PrizeSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true,
    },
    title: String,
    points: Number,
    imageKey: String,
    inventory: Object,
    redemptions: Object
},
{
    collection: 'prize',
    versionKey: false
});
var PrizeModel = mongoose.model('PrizeModel', PrizeSchema);


/**
 * Member functions
 */
var getAllPrizes = function () {
    return PrizeModel.find()
        .then(function (response) {
            return response;
        });
};



var getPrizeById = function (id, field = false) {
    return PrizeModel.findOne({_id: id})
        .then(function (response) {
            if (field) {
                if (response[field] != undefined) {
                    return response[field];
                } else {
                    throw field + " is not a recognized property";
                }
            }
            return response;
        });
};



var getPrizeByTitle = function (title) {
    return PrizeModel.findOne({title: title})
        .then(function (response) {
            return response;
        });
};



var postPrizeCreate = function (data) {
    data = JSON.parse(data);

    var prizeTitle = data.title;
    var checkPrizeTitle = function () {
        return getPrizeByTitle(prizeTitle)
            .then(function (response) {
                return response;
            });
    };

    var savePrizeData = function (newPrizeData) {
        if (newPrizeData == null) {
            newPrizeData = {};
            newPrizeData = data;
            newPrizeData.id = id;
            newPrizeData.inventory = [];
            newPrizeData.redemptions = [];
            var prizeData = new PrizeModel(newPrizeData);
        
            return prizeData.save()
                .then(function (response) {
                    return response;
                });
        } else {
            return "Error: Prize with name: '" + data.title + "' already exists";
        }
    };

    return checkPrizeTitle()
        .then(savePrizeData);

};



var postPrizeUpdateRedemptions = function (data) {
    var attendee = data.attendee;
    var prizeId = data.prizeId;

    if (!attendee || !prizeId)
        throw "Missing Attendee data or Prize ID";

    /* Get a list of Badge IDs of Attendees who redeemed Prize */
    var getPrizeRedemptions = function () {
        return getPrizeById(prizeId, 'redemptions')
            .then(function (response) {
                var redemptionBadgeIds = response.map(function (redemption) {
                    return redemption.badgeNumber.toString();
                });
                return redemptionBadgeIds;
            });
    };

    /* Update the Prize's Redemptions array */
    var updatePrizeRedemptions = function (redemptionsBadgeIds) {
        var attendeeBadgeId = attendee.badgeNumber.toString();
        if (redemptionsBadgeIds.indexOf(attendeeBadgeId) == -1) {
            return PrizeModel.update(
                {_id: prizeId},
                {
                    $push: {
                        redemptions: attendee
                    }
                }
            )
            .then(function (response) {
                return response;
            })
            .catch(function (error) {
                throw error;
            });
        } else {
            return "Attendee has already Redeemed this Prize";
        }
        
    };
    
    /* Chain Promises together in final function call */
    return getPrizeRedemptions()
        .then(updatePrizeRedemptions);
    
};



/**
 * Create Object with all member functions
 */
Prize = {
    getAllPrizes: getAllPrizes,
    getPrizeById: getPrizeById,
    getPrizeByTitle: getPrizeByTitle,
    postPrizeCreate: postPrizeCreate,
    postPrizeUpdateRedemptions: postPrizeUpdateRedemptions
};


/**
 * Export Module
 */
module.exports = Prize;