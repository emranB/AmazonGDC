/**
 * Connection
 **/
var mongoose = require('mongoose');
var uri = 'mongodb://localhost:27017/amazon_gdc';
var connection = mongoose.connect(uri);
var requestPromise = require('request-promise');
var bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * Define Schema
 **/
var Schema = mongoose.Schema;
var id = mongoose.Types.ObjectId();
var UserSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true,
    },
    username: {
        type: String,
        requried: true
    },
    password: {
        type: String,
        required: true
    }
},
{
    collection: 'user',
    versionKey: false
});
var UserModel = mongoose.model('UserModel', UserSchema);



/** 
 * Get Badge Data from ITN API using an Attendee's base-64 identifier 
 **/
var authorizeRfid = function (request) {

    var NDefRec = request.NDefRecord;
    
    /**
     * NOTE:
     *  The ITN API expects KEY for for base-64 string to be passed as
     *  - NdefRecord (<- lower case 'd')
     */
    var params = {
        // ActivationCode: "7C86979",      // Production API
        ActivationCode: "4186598",      // Test API
        AuthKey: "CurrentStudios_1",
        DeviceIdentifier: "Test",
        NdefRecord: NDefRec
    };
    var ApiUrl = "https://mobile.bcard.net/Services/BadgeDataService/BadgeDataService.svc/GetBadgeData";

    var postRequest = {
        method: 'POST',
        uri: ApiUrl,
        body: params,
        json: true
    };

    return requestPromise(postRequest)
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            throw error;
        });
};



/** 
 * Authorize an admin for CMS login 
 **/
var authorizeUser = function (request) {
    var username = request.username;
    var password = request.password;

    return UserModel.findOne({
        "username": username
    }).then(function (data) {
        if (!data) {
            throw "User does not exist";
        }
        var hash = data.password;
        return bcrypt.compare(password, hash)
            .then(function (response) {
                return response;
            });
    })
    .catch(function (error) {
        throw error;
    });
};



/**
 * Create a new Admin for CMS
 **/
var createUser = function (userData) {
    var username = userData.username;
    var password = userData.password;
    var repeat_password = userData.repeat_password;

    if (!username || !password || !repeat_password)
        throw "Error missing information";

    if (password != repeat_password)
        throw "Passwords don't match";
        
    return bcrypt.hash(password, saltRounds)
        .then(function (hash) {
            return UserModel.findOneAndUpdate(
                {username: username},
                {
                    $set: {
                        password: hash
                    }
                },
                {upsert: true, new: true}
            ).exec();
        })
        .catch(function (error) {
            throw "Error: Can't Create New User";
        });

}; 




Session = {
    authorizeUser: authorizeUser,
    authorizeRfid: authorizeRfid,
    createUser: createUser
};

module.exports = Session;
