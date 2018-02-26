var httpStatus = require('http-status-codes');
DemoStation = require('../models/DemoStation');



/**
 * GET /api//demoStations
 * Get a collection of All DemoStations 
 **/
var allDemoStations = function (req, res) {
    DemoStation.getAllDemoStations()
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * GET /api//demoStation/id/:_id
 * Get a single DemoStation by ID 
 **/
var demoStationbyId = function (req, res) {
    var stationId = req.params._id;
    if (!stationId)
        throw 'Missing Station Id';  

    DemoStation.getDemoStationById(stationId)
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * GET /api//demoStation/demoId/:id 
 * Get a single DemoStation by Demo ID 
 **/
var demoStationByDemoId = function (req, res) {
    var demoId = req.params.id;
    if (!demoId) 
        throw 'Missing Demo Id';

    DemoStation.getDemoStationByDemoId(demoId)
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * POST /api/demoStation
 * Create or Update DemoStation 
 **/
var saveDemoStation = function (req, res) {
    var postData = req.body;
    if (!postData || !postData._id) 
        throw 'Missing DemoStation Data';  

    postData = JSON.stringify(postData);

    DemoStation.postDemoStation(postData)
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};




DemoStationExports = {
    allDemoStations: allDemoStations,
    demoStationbyId: demoStationbyId,
    demoStationByDemoId: demoStationByDemoId,
    saveDemoStation: saveDemoStation
};

module.exports = DemoStationExports;