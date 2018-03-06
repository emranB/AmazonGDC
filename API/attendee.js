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
    console.log("attendeejs: ", req.params);
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
      return Demo.getAllDemos().then(function (demos) {
        shuffle(demos);

        return Attendee.getAttendeeByBadgeId(attendeeData.badgeNumber)
            .then(function (response) {
                /* Append dummy value fields for Badge Number being used for the first time */
                console.log('get by badge number', response);
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
                            question: 'This is question 0',
                            answer: ''
                        },
                        {
                            question: 'This is question 1',
                            answer: ''
                        },
                        {
                            question: 'This is question 2',
                            answer: ''
                        },
                        {
                            question: 'This is question 3',
                            answer: ''
                        },
                        {
                            question: 'This is question 4',
                            answer: ''
                        }
                    ];

                    attendeeData.registrationStatus = registrationStatus;
                    attendeeData.questionnaire = questionnaire;

                    attendeeData.demos = [];
                    attendeeData.recomendedDemos = demos.splice(0, 6);
                    attendeeData.pointsAccumulated = 0;
                    attendeeData.pointsCount = 0;
                    attendeeData.redemptions = [];
                    attendeeData.extraQuestionnaire = 'false';
                }

                return attendeeData;
            })
            .catch(function (error) {
                res.status(httpStatus.BAD_REQUEST);
                throw error;
            });
          });
    };

    var postAttendee = function (attendeeData) {
        return Attendee.postAttendee(attendeeData);
    };

    /* Chain functions together in final call */
    return compileAttendeeObject()
        .then(postAttendee)
        .then(function (data) {
            res.redirect('/attendees');
        })
        .catch(function (error) {
            res.status(httpStatus.BAD_REQUEST);
            throw error;
        });

};



/**
 * POST /api/attendee/badgeId/:id/registrationStatus
 * Update Registration Status
 **/
var saveAttendeeRegistrationStatus = function (req, res) {
    var badgeNumber = req.params.id;
    var registrationData = req.body;

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
            res.redirect("/attendee");
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
    
    var attendeeEcryptedId = req.body.attendeeEncryptedId;
    var piId = req.body.demoStationId;
    var badgeId;

    /* Fetch Attendee's Badge ID */
    var getBadgeInfo = function () {
        console.log("getBadgeId");
        // console.trace("getBadgeId");
        return Session.authorizeRfid({NDefRecord: attendeeEcryptedId})
            .then(function (attendee) {
                attendee = attendee.BadgeData;
                badgeId = attendee.StoredUID;
                return attendee;
            })
            .catch(function (error) {
                throw error;
            });
    };

    var updateAttendee = function (attendee) {
        // console.log("attendee.js, attendee:", attendee);
        return Attendee.getAttendeeByBadgeId(badgeId)
            .then(function (response) {
                if (!response) {
                    attendeeData = {
                        badgeNumber: attendee.StoredUID,
                        firstName: attendee.Firstname,
                        lastName: attendee.Lastname,
                        email: attendee.Email,
                        phone: attendee.Phone1,
                        title: attendee.Tile,
                        company: attendee.Company
                    }

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
                            question: 'This is question 0',
                            answer: ''
                        },
                        {
                            question: 'This is question 1',
                            answer: ''
                        },
                        {
                            question: 'This is question 2',
                            answer: ''
                        },
                        {
                            question: 'This is question 3',
                            answer: ''
                        },
                        {
                            question: 'This is question 4',
                            answer: ''
                        }
                    ];
                
                    attendeeData.registrationStatus = registrationStatus;
                    attendeeData.questionnaire = questionnaire;
                    attendeeData.demos = [];
                    attendeeData.pointsAccumulated = 0;
                    attendeeData.pointsCount = 0;
                    attendeeData.redemptions = [];
                    attendeeData.extraQuestionnaire = 'false';

                    return Attendee.postAttendee(attendeeData);
                } else {
                    return attendee;
                }

            });
    };

    /* Create or Update the demoStation */
    var postDemoStation = function () {
        console.log("postDemoStation");
        
        return DemoStation.postDemoStation({piId: piId})
            .then(function (demoStation) {
                return demoStation;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Save demo details in Attendee's profile */
    // var postAttendeeDemo = function (demo) {

    //     if (!demo || !demo._id) 
    //         console.log("no demo");
    // }; 

    /* Save demo details in Attendee's profile */
    var postAttendeeDemo = function (demo) {
        
        if (!demo || !demo._id) {
            // console.log("no demo");
        }

        var attendeeDemoObj = {
            badgeId: badgeId,
            demo: demo
        };
        
        return Attendee.postAttendeeDemo(attendeeDemoObj)
            .then(function (response) {
                // console.log("In attendee.js");
                // console.log(response);
                return response;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Chain together promises for final function call */
    return getBadgeInfo()
        .then(updateAttendee)
        .then(postDemoStation)
        .then(function (demo) {
            if (demo) {
                // console.log("attendeejs: ", demo);
                return postAttendeeDemo(demo)
                    .then(function () {
                        console.log("Posting Attedee Demo");
                        res.send(demo);
                    });
            } else {
                res.send("No demo to post");
            }
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



AttendeeExports = {
    attendees: attendees,
    attendeeById: attendeeById,
    attendeeByBadgeId: attendeeByBadgeId,
    saveAttendee: saveAttendee,
    saveAttendeeRegistrationStatus: saveAttendeeRegistrationStatus,
    saveAttendeeDemo: saveAttendeeDemo,
    saveAttendeeDemoByPiId: saveAttendeeDemoByPiId,
    redeemPrize: redeemPrize
};

module.exports = AttendeeExports;

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}
