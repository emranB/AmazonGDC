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
    title: String,
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

var postDemo = function (data) {
    data = JSON.parse(data);
    data.id = id;
    /* validateData(data) */
    var demoData = new DemoModel(data);

    return demoData.save()
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            throw error;
        });
};


/**
 * Create Object with all member functions
 */
Demo = {
    getAllDemos: getAllDemos,
    getDemoById: getDemoById,
    getDemoByTitle: getDemoByTitle,
    postDemo: postDemo
};


/**
 * Export Module
 */
module.exports = Demo;

