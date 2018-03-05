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
 * GET /api/demoStation/piId/:id
 * Get a single DemoStation by Pi ID 
 **/
/**
 * Look for Demo Station with serial number "stationId"
 *  If it doesn;t exist
 *      Create new demos station
 *      return
 * ELSE
 *      Get demostation info  
 */
var demoStationbyPiId = function (req, res) {
    var stationId = req.params.id;
    if (!stationId)
        throw 'Missing Station Id';  

    DemoStation.getDemoStationByPiId(stationId)
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

    if (!postData) 
        throw 'Missing DemoStation Data';  

    console.log("About to update, in demoStation.js");
    console.log(postData);

    return DemoStation.postDemoStation(postData)
        .then(function (data) {
            console.log("in demoStation.js");
            console.log(data);

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
    demoStationbyPiId: demoStationbyPiId,
    saveDemoStation: saveDemoStation
};

module.exports = DemoStationExports;