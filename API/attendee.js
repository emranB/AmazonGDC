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
      return Demo.getAllDemos().then(function (demos) {
        shuffle(demos);

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
                            // answer: ''
                            answer: 'Cloud Services,Audio Arts'
                        },
                        {
                            key: 'productLifeCycle',
                            question: 'Where in the life cycle are you with your product(s)?',
                            // answer: ''
                            answer: 'Global Expansion, Early Access, Launch'
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



                    attendeeData.title = "Animator";


                    attendeeData.creationTime = new Date().toLocaleString();
                    
                    attendeeData.recommendedDemos = getRecommendedDemosForAttendee(attendeeData.title, attendeeData.questionnaire);

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
                    attendeeInfo = badgeInfo.BadgeData;
                    badgeId = attendeeInfo.StoredUID;

                    var attendeeData = {
                        badgeNumber: attendeeInfo.StoredUID,
                        firstName: attendeeInfo.Firstname,
                        lastName: attendeeInfo.Lastname,
                        email: attendeeInfo.Email,
                        phone: attendeeInfo.Phone1,
                        title: attendeeInfo.Tile,
                        company: attendeeInfo.Company
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


                    attendeeData.recommendedDemos = getRecommendedDemosForAttendee(attendeeData.title, attendeeData.questionnaire);
                    console.log("attendee.js - saveAttendeeDemoByPiId() says: attendeeData = ", attendeeData);
                    throw "stop 123123123123";


                    attendeeData.pointsAccumulated = 0;
                    attendeeData.pointsCount = 0;
                    attendeeData.redemptions = [];
                    attendeeData.extraQuestionnaire = 'false';
        
                    return Attendee.postAttendee(attendeeData);
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
 * POST /api/attendee/badgeId/:badgeId/saveExitQuestionnaire
 * Update Attendee's profile by appending info about Exit Questionnaire
 **/
var saveExitQuestionnaire = function (req, res) {
    var badgeNumber = req.body.badgeId;
    var exitQuestionnaireObj = req.body.exitQuestionnaireObj;
    
    /****************** Dummy values ******************/
    exitQuestionnaireObj = [
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

    return Attendee.postAttendeeExtraQuestionnaire(badgeNumber, exitQuestionnaireObj)
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




AttendeeExports = {
    attendees: attendees,
    attendeeById: attendeeById,
    attendeeByBadgeId: attendeeByBadgeId,
    saveAttendee: saveAttendee,
    saveAttendeeRegistrationStatus: saveAttendeeRegistrationStatus,
    saveAttendeeDemo: saveAttendeeDemo,
    saveAttendeeDemoByPiId: saveAttendeeDemoByPiId,
    saveExitQuestionnaire: saveExitQuestionnaire,
    redeemPrize: redeemPrize,
    deleteAttendeeByBadgeId: deleteAttendeeByBadgeId
};

module.exports = AttendeeExports;



/**
 * Helper Functions
 */
/* Randomize an array of items */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}



/* Get recommended demos for an Attendee, based on job title and interests */ 
var getRecommendedDemosForAttendee =  function (jobTitle, questionnaire) {

    /* Access 'jobTag' using: 'jobTag[jobTitle]' */
    var jobTag = {
        "Animator":             "AN",
        "Audio Engineer":       "AE",
        "Backend Developer":    "BD",
        "Business Dev":         "BZ",
        "Creative Director":    "CD",
        "Devops Engineer":      "DE",
        "Engine Developer":     "ED",
        "Executive":            "EX",
        "Frontend Developer":   "FD",
        "Game Designer":        "GD",
        "Level Designer":       "LD",
        "Producer":             "PR",
        "QA Tester":            "QA",
        "Studio Manager":       "SM",
        "Technical Artist":     "TA"
    };

    /* Access 'interestsTags' using 'interestsTags[interest]' */
    var interestsTags = {
        "Analytics (Game, Server)":         "AN",       /* " (Game, Ser...)"  <-  The comma is a problematic issue, becasue strings are broken down by the commas. Consider telling asking front end to send JSON instead of string */
        "Audio Arts":                       "AA",
        "Cloud Services":                   "CS",
        "Console / Mobile Market":          "CM",       /* Notice the space before and after the backshlash " / ". Front end is not sending data as suck right now */
        "Developer Engineering":            "DE",
        "Game Monetization":                "GM",
        "Get Investors":                    "GI",
        "Launch Practices":                 "LP",
        "Market Distribution":              "MD",
        "Marketing / Media Influencers":    "MM",
        "Middleware Tools":                 "MT",
        "Multiplayer Support":              "MP",
        "Network Protection/Tolerance":     "NP",
        "Reliable Global Scaling":          "RG",
        "Services Deployment":              "SD",
        "Testing Lifecycle":                "TL",
        "Training / Education / Student":   "TE",
        "Visual Arts":                      "VA"
    };

    /* Table to get Demo Spot nubmer by Job Title */
    var demoValByjobTitle = 
    {
        AN: [6],
        AE: [],
        BD: [11,12,14,9,8,10,21,31,30,16,15,18,17,25,27,26,24,28,20,22,13,23,29,32],
        BZ: [25,27,26,28,20,22,13,19,23],
        CD: [11,6,28,19,23],
        DE: [12,14,9,10,21,31,16,15,18,17,24,22,19,29,32],
        ED: [5,30],
        EX: [25,27,28,20,22,13,19,23],
        FD: [11,14,5,6,7,8,10,21,31,30,24,28,19,32],
        GD: [14,5,7,8,31,30,19,29,32],
        LD: [5,7,8,],
        PR: [29],
        QA: [14,17,30],
        SM: [11,18,25,27,26,28,20,22,13,19,23,31,32],
        TA: [5,6,7,8,19]
    };
    
    /* Table to get Demo Spot nubmer by Interest */
    var demoValByInterests = 
    {
        AA: [25,20,22,13],
        AN: [27,28,19,23,29,],
        CS: [11,12,14,9,10,21,31,16,17,25,27,26,24,28,20,22,13,19,23,29,32],
        CM: [12,9,5,30,16,17],
        DE: [11,12,14,9,5,6,7,8,10,21,30,16,15,18,17,26,24,20,22,19,29],
        GM: [27,28,19,23],
        GI: [],
        LP: [14,15,18],
        MD: [30,15,18,26],
        MM: [11,10,25,27,24,28,20,22,13,19,23],
        MT: [11,12,14,9,6,7,8,21,31,30,19,29,32],
        MP: [11,12,14,9,10,16,17,25,24,22,13],
        NP: [15],
        RG: [11,14,21,16,15,18,17],
        SD: [15,26],
        TL: [29],
        TE: [],
        VA: [5,6]
    };

    /* Life Cycle value mapping */
    var productLifeCycleValueMap = {
        "Evaluation":           1,
        "Content / Prototype":  2,
        "PreProduction":        3,
        "Alpha Production":     4,
        "Beta Production":      5,
        "Early Access":         6,
        "Launch":               7,
        "Feedback testing":     8,
        "Live Operations":      9,
        "Global Expansion":     10,
        "Sunset / End of Life": 11
    };


    /* Getting tag for Attendee's job title. */
    jobTitle = jobTitle.trim();
    // jobTitle = "Technical Artist";                  //////////// Dummy val
    var attendeeJobTag = jobTag[jobTitle];

    /* Extracting Attendee's interests from 'questionnaire' object. Returns an array of interest tags. */
    var interests = questionnaire.find(function (question) {
        return question.key == "interests";
    });
    // interests = ["VA"];                             //////////// Dummy val
    if (interests.answer) {
        interests = interests.answer.split(",");
        interests = interests.map(function (interest) {
            interest = interest.trim();
            return interestsTags[interest];
        });
    }

    /* Extracting Attendee's product life cycle */
    var productLifeCycle = questionnaire.find(function (question) {
        return question.key == "productLifeCycle";
    });
    if (productLifeCycle.answer) {
        productLifeCycle = productLifeCycle.answer.split(",");
        productLifeCycle = productLifeCycle.map(function (item) {
            item = item.trim();
            return productLifeCycleValueMap[item];
        });
    }
    // productLifeCycle = [1,2,3];                      //////////// Dummy val


    var attendeeRecommendedDemos = {
        demosByJobTitle: [],
        demosByInterests: []
    };
    /* Get demo spot vals based on Job Title */
    var attendeeDemosByJobTitle = demoValByjobTitle[attendeeJobTag];
    attendeeDemosByJobTitle.map(function (demo) {
        attendeeRecommendedDemos.demosByJobTitle.push(demo);
    });
    /* Get demo spot vals based on EACH OF EVERY interest */
    interests.map(function (interest) {
        var demosForEachInterest = demoValByInterests[interest];
        demosForEachInterest.map(function (demo) {
            attendeeRecommendedDemos.demosByInterests.push(demo);
        });
    });

    /* Get Weights of Demos, based on Life Cycle vals */
    var demoWeightsTable = getDemoWeights(attendeeRecommendedDemos);
    var demoWeightsByLifeCycles = getDemoWeightsByLifeCycles(productLifeCycle, attendeeRecommendedDemos, demoWeightsTable);

    var allDemoWeightsForAllLifeCycles = [];
    demoWeightsByLifeCycles.map(function (LC_obj) {
        for (var i=0; i<LC_obj.demoWeights.length; i++) {
            allDemoWeightsForAllLifeCycles.push(LC_obj.demoWeights[i]);
        }
    });

    /* Sort All Demo Weight from highest to least */
    allDemoWeightsForAllLifeCycles = sortItemsByWeight(allDemoWeightsForAllLifeCycles, "descending");
    var uniqueDemoWeightsForAllLifeCycles = [];
    var demoSpotsPushed_temp = [];
    allDemoWeightsForAllLifeCycles.map(function (row) {
        if (demoSpotsPushed_temp.indexOf(row.demoSpot) == -1) {
            uniqueDemoWeightsForAllLifeCycles.push(row);
        }
        demoSpotsPushed_temp.push(row.demoSpot);
    });

    var topSixRecommendedDemos = uniqueDemoWeightsForAllLifeCycles.map(function (demo) {
        return demo.demoSpot;
    }).slice(0, 6);
    
    return topSixRecommendedDemos;
}


/* Get a list of weights range for each recommended demo for Attendee */
var getDemoWeights = function (demos) {
    /**
     * demoWeightsTable:
     *  "key" : "value"
     *      key = DemoStation / Demo Spot / Demo Index Number
     *      value = Demo Life Cycle range
     **/
    var demoWeightsTable = 
    {
        "11": "1-6",
        "12": "1-10",
        "14": "1-6",
        "9": "4-10",
        "5": "1-4",
        "6": "1-4",
        "7": "1-4",
        "8": "1-4",
        "10": "5-10",
        "4": "0-0",
        "21": "1-5",
        "31": "1-4",
        "30": "1-4",
        "1":  "0-0",
        "2A": "0-0",
        "2B": "0-0",
        "3": "0-0",
        "16": "4-9",
        "15": "6-9",
        "18": "5-9",
        "17": "5-10",
        "25": "5-10",
        "27": "5-10",
        "26": "6-10",
        "24": "5-10",
        "28": "6-10",
        "20": "6-9",
        "22": "8-10",
        "13": "6-10",
        "19": "6-10",
        "23": "7-10",
        "29": "8-9",
        "32": "1-4"
    };

    /**
     * ----------------------------------
     * Generating Demo Life Cycles Table
     * ----------------------------------
     * For EACH Demo
     *      - Get Life Cycle Range
     *      - Find Midpoint of range
     *      - Assign value '1' for demo's MID lifecycle value
     *          - If midpoint is uneven, round up
     *      - Assign weight value '0.8' to LOWEST lifecycle value
     *          - Range all lifecycle values in between from '0.8' to ' < 1.0'
     *      - Assign weight value '0.8' to HIGHEST lifecycle value
     *          - Range all lifecycle values in between from '> 1.0 to ' 0.8'
     *      - Create object -> {lifeCycle : weight}
     *      - Push into array and return
     * 
     * 
     * Output data structure: An Object of Array of Objects
     * LC_table = {
     *      demo1: [
     *          {'1' : 0.9},
     *          {'2' : 1},
     *          {'3' : 0.9},
     *      ],
     *      demo2: [
     *          {'7' : 0.9},
     *          {'8' : 1},
     *          {'9' : 0.9},
     *      ]
     * };
     **/
    var allDemos = demos.demosByJobTitle.concat(demos.demosByInterests);
    var allUniqueDemos = [...new Set(allDemos)];

    var LC_table = {};
    for (var i=0; i<allUniqueDemos.length; i++) {
        var demoWeightsArr = [];
        var demo = allUniqueDemos[i];
        var demoLifeCycleRange = demoWeightsTable[demo];
        if (demoLifeCycleRange == "0-0") {
            break;
        }

        /** 
         * LC_ -> LifeCycle 
         **/
        var LC_ = demoLifeCycleRange.split("-");

        var LC_lower = LC_[0].trim();
        LC_lower = parseInt(LC_lower);

        var LC_upper = LC_[1].trim();
        LC_upper = parseInt(LC_upper);

        var LC_mid = LC_lower + (LC_upper - LC_lower) / 2;
        LC_mid = Math.ceil(LC_mid);

        /* Getting demo weights for lower range of LifeCycle -> Minimum LifeCycle to Mid Point of LifeCycle */
        var LC_lower_range = LC_mid - LC_lower;
        var count = 0;
        for (var j=LC_lower; j<LC_mid; j++) {
            var increment = (count * ( (1 - 0.8) / LC_lower_range ));
            if (LC_lower_range == 1) {
                increment = 0.1;
            }
            var value = 0.8 + increment;
            var obj = {
                lifeCycleVal: j,
                weightCoefficient: value
            };
            demoWeightsArr.push(obj);
            count++;
        }

        /* Getting demo weights for upper range of LifeCycle -> Mid Point of LifeCycle to Maximum LifeCycle  */
        var LC_upper_range = LC_upper - LC_mid;
        count = 0;
        for (var j=LC_mid; j<=LC_upper; j++) {
            var decrement = (count * ( (1 - 0.8) / LC_upper_range ));
            if (LC_upper_range == 1 && j != LC_mid) {
                decrement = 0.1;
            }
            if (LC_upper_range == 0) {
                decrement = 0;
            }
            var value = 1 - decrement;
            var obj = {
                lifeCycleVal: j,
                weightCoefficient: value
            };
            demoWeightsArr.push(obj);
            count++;
        }

        LC_table[demo] = demoWeightsArr;
    }

    return LC_table;
};


/** 
 * Get Demo Weights by LifeCycle(s) specified by Attendee 
 **/
var getDemoWeightsByLifeCycles = function (lifeCycles, demos, demoWeightsTable) {
    var JT = 0;
    var JI = 0;
    var LC = 0;
    var FW = 1;

    var allDemos = demos.demosByJobTitle.concat(demos.demosByInterests);
    var allUniqueDemos = [...new Set(allDemos)];

    var attendeeDemoWeightsByLifeCycle = [];

    for (var i=0; i<lifeCycles.length; i++) {
        var lifeCycle = parseInt(lifeCycles[i]);
        var attendeeDemosWithWeights = [];

        for (var j=0; j<allUniqueDemos.length; j++) {
            var demo = allUniqueDemos[j];
            var demoWeightsScale = demoWeightsTable[demo];

            var demoWeightCoefficientForLifeCycle = demoWeightsScale.find(function (item) {
                return item.lifeCycleVal == parseInt(lifeCycle);
            });
            if (!demoWeightCoefficientForLifeCycle) {
                demoWeightCoefficientForLifeCycle = {
                    demoSpot: demo,
                    weight: 0
                };
            } else {
                if (demos.demosByJobTitle.indexOf(demo) != -1) { // If demo exists in recommendations by Job Title
                    JT = 1;
                }
                if (demos.demosByInterests.indexOf(demo) != -1) { // If demo exists in recommendations by Interests
                    JI = 1;
                }
                if (demoWeightCoefficientForLifeCycle.weightCoefficient) {
                    LC = demoWeightCoefficientForLifeCycle.weightCoefficient;
                }
                var weight = calculateWeight(JT, JI, LC, FW);

                demoWeightCoefficientForLifeCycle = {
                    demoSpot: demo,
                    weight: weight
                };
            }

            attendeeDemosWithWeights.push(demoWeightCoefficientForLifeCycle);
        }

        var obj = {
            lifeCycleVal: lifeCycle,
            demoWeights: attendeeDemosWithWeights
        };
        attendeeDemoWeightsByLifeCycle.push(obj);
    }

    return attendeeDemoWeightsByLifeCycle;
};


/* Calculate weight of demo */
var calculateWeight = function (JT, JI, LC, FW) {
    var weight = (((JT + JI) * LC) * FW);
    return weight;
};


/* Sort Demos based on weight */
var sortItemsByWeight = function (demoObjsArray, sortOrder) {
    if (sortOrder == "descending") {
        demoObjsArray.sort(function (a, b) {
            if (a.weight > b.weight)
                return -1;
            if (a.weight < b.weight)
                return 1;
            return 0;
        });
    } else {
        demoObjsArray.sort(function (a, b) {
            if (a.weight < b.weight)
                return -1;
            if (a.weight > b.weight)
                return 1;
            return 0;
        });
    }

    return demoObjsArray;
}