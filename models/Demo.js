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
var DemoSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true,
    },
    index: String,
    // index: Number,
    title: String,
    points: Number,
    team: String,
    category: String,
    description: String,
    requireCheckout: String
}, 
{
    collection: 'demo',
    versionKey: false
});
var DemoModel = mongoose.model('DemoModel', DemoSchema);


/**
 * Member Functions
 **/
var getAllDemos = function () {
    return DemoModel.find()
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            throw error;
        });
};

var getDemoById = function (id) {
    return DemoModel.findOne({_id: id})
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            throw error;
        });
};

var getDemoByTitle = function (name) {
    return DemoModel.findOne({title: name})
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            throw error;
        });
};

var getDemoBySpotNumber = function (demoSpotNumber) {
    return DemoModel.findOne(
        {index: demoSpotNumber}
    )
    .then(function (data) {
        return data;
    })
    .catch(function (error) {
        throw error;
    });
}; 

var postDemo = function (data) {
    data = JSON.parse(data);
    
    var demoData = data;
    if (!demoData._id) {
        demoData = new DemoModel(demoData);
    }

    return DemoModel.findOneAndUpdate(
        {_id: demoData._id},
        {
            $set: {
                index: demoData.index,
                title: demoData.title,
                points: demoData.points,
                team: demoData.team,
                category: demoData.category,
                requireCheckout: demoData.requireCheckout,
                description: demoData.description
            }
        },
        {upsert: true, new: true}
    ).exec();
};

var deleteDemo = function (id) {
    return DemoModel.findOneAndRemove(
        {_id: id}
    ).exec();
};



/**
 * Create Object with all member functions
 */
Demo = {
    getAllDemos: getAllDemos,
    getDemoById: getDemoById,
    getDemoByTitle: getDemoByTitle,
    postDemo: postDemo,
    deleteDemo: deleteDemo,
    getDemoBySpotNumber: getDemoBySpotNumber
};


/**
 * Export Module
 */
module.exports = Demo;

