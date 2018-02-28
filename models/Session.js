/** 
 * Connection 
 **/
var mongoose = require('mongoose');
var uri = 'mongodb://localhost:27017/amazon_gdc';
var connection = mongoose.connect(uri);
var requestPromise = require('request-promise');

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


var authorizeRfid = function (request) {
    var NdefRec = request.NdefRecord;
    var params = {
        ActivationCode: "4186598",
        AuthKey: "CurrentStudios_1",
        DeviceIdentifier: "Test",
        NdefRecord: NdefRec
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


var authorizeUser = function (request) {
    var username = request.username;
    var password = request.password;

    return UserModel.findOne({
        "username": username,
        "password": password
    }).then(function (data) {
        return data;
    })
    .catch(function (error) {
        throw error;
    });
};


Session = {
    authorizeUser: authorizeUser,
    authorizeRfid: authorizeRfid
};

module.exports = Session;