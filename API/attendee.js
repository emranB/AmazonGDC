var httpStatus = require('http-status-codes');
Attendee = require('../models/Attendee');
Demo = require('../models/Demo');
DemoStation = require('../models/DemoStation');
Prize = require('../models/Prize');
Session = require('../models/Session');



/**
 * GET /api/attendees
 * Get a list of all Attendees
 **/
var attendees = function (req, res) {
    Attendee.getAllAttendees()
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * GET /attendee/id/:id
 * Get an Attendee by ID
 **/
var attendeeById = function (req, res) {
    var attendeeId = req.params.id;
    if (!attendeeId)
        throw 'Missing Attendee Id';

    return Attendee.getAttendeeById(attendeeId)
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * GET /api/attendee/badgeId/:id
 * Get an Attendee by Badge ID
 **/
var attendeeByBadgeId = function (req, res) {
    var badgeId = req.params.id;
    if (!badgeId)
        throw 'Missing Badge Id';

    return Attendee.getAttendeeByBadgeId(badgeId)
        .then(function (data) {
            res.status(httpStatus.OK).send(data);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * POST /api/attendee
 * Create or Update an Attendee
 **/
var saveAttendee = function (req, res) {
    var attendeeData = req.body;

    /* Dummy Data value. On live server, this info will be returned from RFID */
    // attendeeData = {
    //     badgeNumber: '8046701A0F4704',
    //     firstName: 'test_fName',
    //     lastName: 'test_lName',
    //     email: 'a@b.com',
    //     phone: '902-111-2222',
    //     title: 'test_title',
    //     company: 'test_company'
    // };
    /**************************************************************************/

    if (!attendeeData)
        throw 'Missing Attendee Data';

    var compileAttendeeObject = function () {
        return Attendee.getAttendeeByBadgeId(attendeeData.badgeNumber)
            .then(function (response) {
                /* Append dummy value fields for Badge Number being used for the first time */
                if (response == null) {
                    var registrationStatus = {
                        scanned: 'true',
                        terms: 'false',
                        question_0: 'false',
                        question_1: 'false',
                        question_2: 'false',
                        question_3: 'false',
                        question_4: 'false',
                        complete: 'false'
                    };

                    var questionnaire = [
                        {
                            key: 'sizeOfCompany',
                            question: 'What is the size of your company?',
                            answer: ''
                        },
                        {
                            key: 'interests',
                            question: 'What are your interests?',
                            answer: ''
                        },
                        {
                            key: 'productLifeCycle',
                            question: 'Where in the life cycle are you with your product(s)?',
                            answer: ''
                        },
                        {
                            key: 'familiarity',
                            question: 'Before today, how familiar were you with Amazon’s offerings for game developers?',
                            answer: ''
                        },
                        {
                            key: 'likelihoodOfGettingAmazon',
                            question: 'How likely are you to try out at least one Amazon offering for game developers when you get home?',
                            answer: ''
                        }
                    ];

                    attendeeData.registrationStatus = registrationStatus;
                    attendeeData.questionnaire = questionnaire;
                    attendeeData.demos = [];
                    attendeeData.creationTime = new Date().toLocaleString();
                    // attendeeData.recommendedDemos = getRecommendedDemosForAttendee(attendeeData.title, attendeeData.questionnaire);
                    attendeeData.recommendedDemos = [];
                    attendeeData.pointsAccumulated = 0;
                    attendeeData.pointsCount = 0;
                    attendeeData.redemptions = [];
                    attendeeData.extraQuestionnaire = 'false';
                    attendeeData.hasSeenRegistrationRequest = 'false';
                    attendeeData.tapEvents = [];
                    attendeeData.note = "";
                }

                return attendeeData;
            })
            .catch(function (error) {
                res.status(httpStatus.BAD_REQUEST);
                throw error;
            });
    };

    var postAttendee = function (attendeeData) {
        return Attendee.postAttendee(attendeeData);
    };

    /* Chain functions together in final call */
    return compileAttendeeObject()
        .then(postAttendee)
        .then(function (data) {
            res.send(data);
            // res.redirect('/attendees');
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });

};



/**
 * POST /api/attendee/badgeId/:id/registrationStatus
 * Update Registration Status
 * 
 * Expected Data Structure:
 * {
 *      "scanned"   : "false",
 *      "terms"     : "true",
 *      "answer_0"  : "",
 *      "answer_1"  : "",
 *      "answer_2"  : "",
 *      "answer_3"  : "2",
 *      "answer_4"  : "2,2,2,2,2",
 *      "answer_5"  : "2",
 *      "complete" : "false"
 * }
 **/
var saveAttendeeRegistrationStatus = function (req, res) {
    var badgeNumber = req.params.id;
    var registrationData = req.body;

    /*****************************************************
     * Dummy Value */
    registrationData = 
    {
         "scanned"   : "true",
         "terms"     : "true",
         "answer_0"  : "Student",
         "answer_1"  : "Network Protection/Tolerance,Services Deployment,Testing Lifecycle",
         "answer_2"  : "Alpha Production,Beta Production,Feedback testing",
         "answer_3"  : "answer 3 here",
         "answer_4"  : "answer 4 here",
         "answer_5"  : "answer 5 here",
         "complete" : "false"
    };
    /**/

    var attendeeObj = {
        badgeNumber: badgeNumber,
        registrationData: registrationData
    };

    return Attendee.postAttendeeRegistrationStatus(attendeeObj)
        .then(function (data) {
            if (data.ok) {
                data = "Successfully posted";
            } else {
                data = "Failed!";
            }
            res.send("data");
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * POST /api/attendee/badgeId/:badgeId/demo/:demoId
 * Update Registration Status
 **/
var saveAttendeeDemo = function (req, res) {
    var badgeId = req.params.badgeId;
    var demoId = req.params.demoId;

    /* Fetch Demo Details */
    var getDemoDetails = function () {
        return Demo.getDemoById(demoId)
            .then(function (demo) {
                var attendeeDemoObj = {
                    badgeId: badgeId,
                    demo: demo
                };

                return attendeeDemoObj;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Save demo details in Attendee's profile */
    var postAttendeeDemo = function (data) {
        Attendee.postAttendeeDemo(data)
            .then(function (response) {
                return response;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Chain together promises for final function call */
    return getDemoDetails()
        .then(postAttendeeDemo)
        .then(function (data) {
            res.redirect("/attendees");
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * POST /api/attendee/logDemoByDemoStation
 * Extract demo from demoStation and save in attendee object
 **/
var saveAttendeeDemoByPiId = function (req, res) {

    var attendee = req.body.attendee;
    var attendeeEcryptedId = req.body.attendeeEncryptedId;
    var piId = req.body.demoStationId;
    var badgeId;

    var updateAttendee = function () {
        console.log("attendee.js says: saveAttendeeDemoByPiId() -> updateAttendee()");

        /* If no attendee object is passed to this function, create a new attendee */
        if (!attendee) {
            console.log("attendee.js says: saveAttendeeDemoByPiId() - updateAttendee() - Creating New Attendee Object");

            return Session.authorizeRfid({NDefRecord: attendeeEcryptedId})
                .then(function (badgeInfo) {
                    // attendeeInfo = badgeInfo.BadgeData;
                    // badgeId = attendeeInfo.StoredUID;

                    // var attendeeData = {
                    //     badgeNumber: attendeeInfo.StoredUID,
                    //     firstName: attendeeInfo.Firstname,
                    //     lastName: attendeeInfo.Lastname,
                    //     email: attendeeInfo.Email,
                    //     phone: attendeeInfo.Phone1,
                    //     title: attendeeInfo.Tile,
                    //     company: attendeeInfo.Company
                    // }
        
                    // var registrationStatus = {
                    //     scanned: 'true',
                    //     terms: 'false',
                    //     question_0: 'false',
                    //     question_1: 'false',
                    //     question_2: 'false',
                    //     question_3: 'false',
                    //     question_4: 'false',
                    //     complete: 'false'
                    // };
                
                    // var questionnaire = [
                    //     {
                    //         key: 'sizeOfCompany',
                    //         question: 'What is the size of your company?',
                    //         answer: ''
                    //     },
                    //     {
                    //         key: 'interests',
                    //         question: 'What are your interests?',
                    //         answer: ''
                    //     },
                    //     {
                    //         key: 'productLifeCycle',
                    //         question: 'Where in the life cycle are you with your product(s)?',
                    //         answer: ''
                    //     },
                    //     {
                    //         key: 'familiarity',
                    //         question: 'Before today, how familiar were you with Amazon’s offerings for game developers?',
                    //         answer: ''
                    //     },
                    //     {
                    //         key: 'likelihoodOfGettingAmazon',
                    //         question: 'How likely are you to try out at least one Amazon offering for game developers when you get home?',
                    //         answer: ''
                    //     }
                    // ];
                
                    // attendeeData.registrationStatus = registrationStatus;
                    // attendeeData.questionnaire = questionnaire;
                    // attendeeData.demos = [];


                    // attendeeData.recommendedDemos = getRecommendedDemosForAttendee(attendeeData.title, attendeeData.questionnaire);
                    // console.log("attendee.js - saveAttendeeDemoByPiId() says: attendeeData = ", attendeeData);
                    // throw "stop 123123123123";


                    // attendeeData.pointsAccumulated = 0;
                    // attendeeData.pointsCount = 0;
                    // attendeeData.redemptions = [];
                    // attendeeData.extraQuestionnaire = 'false';
        
                    // return Attendee.postAttendee(attendeeData);
                })
                .catch(function (error) {
                    throw error;
                });
        } else {
            badgeId = attendee.badgeNumber;
            return Attendee.getAttendeeByBadgeId(attendee.badgeNumber);
        }

    };

    /* Create or Update the demoStation */
    var postDemoStation = function () {
        console.log("attendee.js says: saveAttendeeDemoByPiId() - postDemoStation() - Creating / Editing DemoStation");
        
        return DemoStation.postDemoStation({piId: piId})
            .then(function (demoStation) {
                return demoStation;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Save demo details in Attendee's profile */
    var postAttendeeDemo = function (demoStation) {
        console.log("attendee.js says: saveAttendeeDemoByPiId() - postDemoStation() - Posting Demo in Attendee object");

        if (!demoStation || !demoStation._id) {
            throw 'attendee.js says: Something went wrong in postAttendeeDemo()';
        }

        var attendeeDemoObj = {
            badgeId: badgeId,
            demo: demoStation.demo
        };
        
        return Attendee.postAttendeeDemo(attendeeDemoObj)
            .then(function (response) {
                return response;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Chain together promises for final function call */
    return updateAttendee()
        .then(postDemoStation)
        .then(postAttendeeDemo)
        .then(function (response) {
            res.send(response);
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });
};



/**
 * POST /api/attendee/badgeId/:badgeId/redeemPrize/:prizeId
 * Update Attendee's profile by appending info about prize redeemed
 **/
var redeemPrize = function (req, res) {
    var badgeNumber = req.params.badgeId;
    var prizeId = req.params.prizeId;

    /* Get a list of IDs of prizes that have already been redeemed by Attendee */
    var getAttendeeRedemptions = function () {
        return Attendee.getAttendeeByBadgeId(badgeNumber, "redemptions")
            .then(function (redemptions) {
                var redemptionIds = redemptions.map(function (prize) {
                    return prize._id;
                });
                return redemptionIds;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Get available points that Attendee has not Redeemed */
    var getAttendeePoints = function () {
        return Attendee.getAttendeeByBadgeId(badgeNumber, "pointsCount")
            .then(function (pointsCount) {
                return pointsCount;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Get Attendee info */
    var getAttendee = function () {
        return Attendee.getAttendeeByBadgeId(badgeNumber)
            .then(function (attendee) {
                return attendee;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Get the object that stores all info for the Prize */
    var getPrizeInfo = function () {
        return Prize.getPrizeById(prizeId)
            .then(function (prizeInfo) {
                return prizeInfo;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Append Prize info to Attendee's Redemptions array */
    var updateAttendeeRedemptions = function (prizeInfo) {
        return Attendee.postAttendeeRedemptions(badgeNumber, prizeInfo)
            .then(function (data) {
                return data;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Chain function together in final call */
    return getAttendeeRedemptions()
        .then(function (redemptionIds) {
            if (redemptionIds.indexOf(prizeId) == -1) {
                return getPrizeInfo()
                    .then(function (prizeInfo) {
                        var prizePoints = prizeInfo.points;
                        return getAttendeePoints()
                            .then(function (attendeePoints) {
                                if (attendeePoints >= prizePoints) {
                                    return updateAttendeeRedemptions(prizeInfo)
                                        .then(getAttendee)
                                        .then(function (attendee) {
                                            var obj = {
                                                attendee: attendee,
                                                prizeId: prizeInfo._id.toString()
                                            };
                                            return Prize.postPrizeUpdateRedemptions(obj);
                                        })
                                        .then(function () {
                                            res.redirect("/attendees");
                                        });
                                } else {
                                    console.log("Points Count: " + attendeePoints + " | Required: " + prizePoints);
                                    res.redirect("/attendees");
                                }
                            })
                    })
            } else {
                console.log("Prize has already been redeemed by Attendee");
                res.redirect("/attendees");
            }
        });
};



/**
 * POST /api/attendee/badgeId/:id/extraQuestionnaire
 * Update Attendee's profile by appending info about Exit Questionnaire
 **/
var saveAttendeeExtraQuestionnaire = function (req, res) {
    var badgeNumber = req.params.id;
    var extraQuestionnaireObj = req.body.extraQuestionnaireObj;
    
    /****************** Dummy values ******************/
    extraQuestionnaireObj = [
        {
            question_0: "This is question 0",
            answer_0: "This is answer 0"
        },
        {
            question_1: "This is question 1",
            answer_1: "This is answer 1"
        },
        {
            question_2: "This is question 2",
            answer_2: "This is answer 2"
        }
    ];
    /**************************************************/

    return Attendee.postAttendeeExtraQuestionnaire(badgeNumber, extraQuestionnaireObj)
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            throw error;
        });
};



/**
 * DELETE /api/attendee/badgeId/:badgeId
 * Delete an Attendee by Badge ID
 **/
var deleteAttendeeByBadgeId = function (req, res) {
    var badgeNumber = req.params.badgeId;
    
    return Attendee.deleteByBadgeId(badgeNumber)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            throw error;
        });
};



/**
 * POST /api/attendee/flagAttendeeHasSeenRegistrationRequest
 * Update Attendee's 'hasSeenRegistrationRequest' field as true
 **/
var flagAttendeeHasSeenRegistrationRequest = function (req, res) {
    var badgeId = req.body.badgeId;

    return Attendee.flagAttendeeHasSeenRegistrationRequest(badgeId)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            throw error;
        });
};



/**
 * POST /api/attendee/flagAttendeeHasSeenRegistrationRequest
 * Update Attendee's 'hasSeenRegistrationRequest' field as true
 **/
var logTapEventForAttendee = function (req, res) {
    var attendee = req.body.attendee;
    var demoStationPiId = req.body.demoStationPiId;
    var timeStamp = req.body.timeStamp;

    var getDemoStation = function () {
        return DemoStation.getDemoStationByPiId(demoStationPiId)
            .then(function (demoStation) {
                return demoStation;
            });
    };

    var logTapEvent = function (demoStation) {
        var request = {
            attendee: attendee,
            demoStationObj: demoStation,
            timeStamp: timeStamp
        };
        
        return Attendee.logTapEvent(request)
            .then(function (data) {
                return data;
            });
    };

    return getDemoStation()
        .then(logTapEvent)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            throw error;
        });
};



/**
 * POST /api/attendee/badgeId/:id/addNote
 * Update Attendee's 'hasSeenRegistrationRequest' field as true
 * 
 * Expects: 
 *      {
 *          note: "Here is some note"
 *      }
 **/
var addNote = function (req, res) {
    var badgeId = req.params.id;
    var note = req.body.note;

    return Attendee.addNote(badgeId, note)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            throw error;
        });
};



/**
 * POST /api/attendee/badgeId/:id/deductPoints
 * Update Attendee's pointsAccumulated
 * 
 * Expects: 
 *      {
 *          points: 1000
 *      }
 **/
var deductPoints = function (req, res) {
    var badgeId = req.params.id;
    var points = req.body.points;

    return Attendee.deductPoints(badgeId, points)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (error) {
            throw error;
        });
};


AttendeeExports = {
    attendees: attendees,
    attendeeById: attendeeById,
    attendeeByBadgeId: attendeeByBadgeId,
    saveAttendee: saveAttendee,
    saveAttendeeRegistrationStatus: saveAttendeeRegistrationStatus,
    saveAttendeeDemo: saveAttendeeDemo,
    saveAttendeeDemoByPiId: saveAttendeeDemoByPiId,
    saveAttendeeExtraQuestionnaire: saveAttendeeExtraQuestionnaire,
    redeemPrize: redeemPrize,
    deleteAttendeeByBadgeId: deleteAttendeeByBadgeId,
    flagAttendeeHasSeenRegistrationRequest: flagAttendeeHasSeenRegistrationRequest,
    logTapEventForAttendee: logTapEventForAttendee,
    addNote: addNote,
    deductPoints: deductPoints
};

module.exports = AttendeeExports;






