var httpStatus = require('http-status-codes');
Demo = require('../models/Demo');



/**
 * GET /api/demos
 * Get a collection of All Demos 
 **/
var allDemos = function (req, res) {
    Demo.getAllDemos()
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * GET /api/demo/id/:_id
 * Get a single Demo by ID 
 **/
var demoById = function (req, res) {
    var demoId = req.params._id;

    if (!demoId) 
        throw 'Missing Demo ID';

    Demo.getDemoById(demoId)
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * GET /api/demo/title/:title
 * Get a single Demo by Title
 **/
var demoByTitle = function (req, res) {
    var title = req.params.title;
    if (!title) 
        throw 'Missing Demo Title Name';    

    Demo.getDemoByTitle(title)
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * POST /api/demo
 * Create or Update Demo 
 **/
var saveDemo = function (req, res) {
    var postData = JSON.stringify(req.body);
    if (!postData) 
        throw 'Missing Demo Data';  

    Demo.postDemo(postData)
        .then(function (data) {
            res.redirect("/demos");
            // res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};




DemoExports = {
    allDemos: allDemos,
    demoById: demoById,
    demoByTitle: demoByTitle,
    saveDemo: saveDemo
}

module.exports = DemoExports;