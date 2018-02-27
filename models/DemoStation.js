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
var DemoStationSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true,
    },
    demo: Object
},
{
    collection: 'demoStation',
    versionKey: false
});
var DemoStationModel = mongoose.model('DemoStationModel', DemoStationSchema);


/**
 * Member functions
 */
var getAllDemoStations = function () {
    return DemoStationModel.find()
        .then(function (response) {
            return response;
        });
};

var getDemoStationById = function (id) {
    return DemoStationModel.findOne({_id: id})
        .then(function (response) {
            return response;
        });
};

var getDemoStationByDemoId = function (id) {
    return DemoStationModel.findOne({demoId: id})
        .then(function (response) {
            return response;
        });
};

var postDemoStation = function (data) {
    data = JSON.parse(data);
    data._id = mongoose.Types.ObjectId(data._id);
    var demoStationData = {
        id: id,
        demo: data
    };
    demoStationData = new DemoStationModel(demoStationData);

    return demoStationData.save()
        .then(function (response) {
            return response;
        });
};


/**
 * Create Object with all member functions
 */
DemoStation = {
    getAllDemoStations: getAllDemoStations,
    getDemoStationById: getDemoStationById,
    getDemoStationByDemoId: getDemoStationByDemoId,
    postDemoStation: postDemoStation
};


/**
 * Export Module
 */
module.exports = DemoStation;