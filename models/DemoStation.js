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

    if (!data && !data.piId && !data.demo) {
        throw "DemoStation.js says: No data provided";
    }

    var piId = data.piId;
    var demo = {};
    if (data.demo && data.demo._id) {
        demo = data.demo;
    }

    /* Check if demoStation exists */
    var checkIfDemoStationExists = function () {
        return getDemoStationByPiId(piId)
            .then(function (demoStation) {
                return demoStation;
            });
    };    

    /**
     * CASE 1: No DemoStation:
     *      SubCASE A: No Demo:
     *                  - Create DemoStaion with no Demo
     *      SubCASE B: Has Demo:
     *                  - Create DemoStation with Demo
     * CASE 2: Has DemoStation:
     *      SubCASE A: No Demo:
     *                  - Do Nothing
     *      SubCASE B: Has Demo:
     *                  - Update DemoStation with new Demo
     * 
     * return DemoStation
     */
    var controlDemoStation = function (demoStation) {
        if (demoStation && demoStation._id) {
            if (demo && demo._id) {
                return updateDemoStation(demo);
            } else {
                return demoStation;
            }
        } else {
            if (demo && demo._id) {
                return updateDemoStation(demo);
            } else {
                return updateDemoStation(demo);
            }
        }
    };

    /* Helper function to update DemoStation when required */
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

    /* Chain promises together in final function call */
    return checkIfDemoStationExists()
        .then(controlDemoStation);

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