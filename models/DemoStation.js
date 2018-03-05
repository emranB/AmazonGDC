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
    piId: String,
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

var getDemoStationByPiId = function (id) {
    return DemoStationModel.findOne({piId: id})
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
    var piId = data.piId;
    var demo = {};

    /* Check if demoStation exists */
    var checkIfExists = function () {
        return getDemoStationByPiId(piId)
            .then(function (demoStation) {
                if (demoStation) {
                    if (data.demo && data.demo._id) {
                        demo = data.demo;
                        return updateDemoStation(demo);
                    } else {
                        return getDemoStationByPiId(piId)
                            .then(function (demoStation) {
                                demo = demoStation.demo;
                                return demo;
                            });
                    }
                } else {
                    return updateDemoStation(demo);
                }
            });
    };

    // var getDemoForDemoStation = function (demoStation) {
        
    // };

    var updateDemoStation = function (demo) {
        return DemoStationModel.findOneAndUpdate(
            {piId: data.piId},
            {
                $set: {
                    demo: demo
                }
            },
            {upsert: true, new: true}
        ).exec();
    };

    return checkIfExists();
        // .then(getDemoForDemoStation)
        // .then(function (demoStation) {
        //     return updateDemoStation()
        //         .then(function (data) {
        //             return data;
        //         });
        // });

};




/**
 * Create Object with all member functions
 */
DemoStation = {
    getAllDemoStations: getAllDemoStations,
    getDemoStationById: getDemoStationById,
    getDemoStationByPiId: getDemoStationByPiId,
    getDemoStationByDemoId: getDemoStationByDemoId,
    postDemoStation: postDemoStation
};


/**
 * Export Module
 */
module.exports = DemoStation;