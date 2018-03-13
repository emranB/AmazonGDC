/** 
 * Connection 
 **/
var mongoose = require('mongoose');
var uri = 'mongodb://localhost:27017/amazon_gdc';
var connection = mongoose.connect(uri);


/* Points rewarded for viewing a single Demo */
const DEMO_POINTS = 100;




/** 
 * Define Schema
 **/
var Schema = mongoose.Schema;
var id = mongoose.Types.ObjectId();
var AttendeeSchema = new Schema({
    badgeNumber: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    title: String,
    company: String,
    registrationStatus: Object,
    questionnaire: Object,
    demos: Object,
    recommendedDemos: Object,
    pointsAccumulated: Number,
    pointsCount: Number,
    redemptions: Object,
    extraQuestionnaire: Object,
    creationTime: String,
    hasSeenRegistrationRequest: String
}, 
{
    collection: 'attendee',
    versionKey: false
});
var AttendeeModel = mongoose.model('AttendeeModel', AttendeeSchema);



/**
 * Member Functions
 **/
var getAttendeeById = function (id) {
    return AttendeeModel.findOne({_id: id})
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            throw error;
        });
};



var getAllAttendees = function () {
    return AttendeeModel.find()
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            throw error;
        });
};



/**
 * @param {String} id - Badge ID / Number 
 * @param {String} field - Name of specific field in response array, set to 'false' by default 
 */
var getAttendeeByBadgeId = function (id, field = false) {
    return AttendeeModel.findOne({badgeNumber: id})
        .then(function (data) {
            if (field) {
                if (data[field] != undefined) {
                    return data[field];
                } else {
                    throw field + " is not a recognized property";
                }
            }
            return data;
        })
        .catch(function (error) {
            throw error;
        });
};



var postAttendee = function (data) {
    return getAttendeeByBadgeId(data.badgeNumber)
        .then(function (response) {
            var attendeeData = data;

            if (response == null) {
                attendeeData = new AttendeeModel(data);
            }

            /* Set 'upsert' to true to create new entry, if Badge ID does not exist in db */
            return AttendeeModel.findOneAndUpdate(
                {badgeNumber: attendeeData.badgeNumber},
                attendeeData,
                {upsert: true, new: true}
            ).exec();;
        })
        .catch(function (error) {
            throw error;
        });
};



var postAttendeeRegistrationStatus = function (attendeeObj) {
    
    /* Retrieve and appropriately format data */
    var parseAttendeeDetails = function () {
        return getAttendeeByBadgeId(attendeeObj.badgeNumber)
            .then(function (response) {
                /* Extracting currently saved data from db */
                var oldDataStatus = response.registrationStatus;
                var oldDataStatus_keys = Object.keys(oldDataStatus);
                var oldDataStatus_vals = Object.keys(oldDataStatus).map(function (key) {
                    return oldDataStatus[key];
                });
                /* Extracting answers that are currently existing in db */
                var oldDataQuestionnaire = response.questionnaire;
                var oldDataKeysArray = oldDataQuestionnaire.map(function (row) {
                    return row.key;
                });
                var oldDataQuestionsArray = oldDataQuestionnaire.map(function (row) {
                    return row.question;
                });
                var oldDataAnswersArray = oldDataQuestionnaire.map(function (row) {
                    return row.answer;
                });

                /* New data sent fromm front-end, to be saved */
                var newDataStatus = attendeeObj.registrationData;
                var newDataStatus_keys = Object.keys(newDataStatus);
                var newDataStatus_vals = Object.keys(newDataStatus).map(function (key) {
                    return newDataStatus[key];
                });

                /* Redering new registrationStatus Object */
                var newStatusObj = oldDataStatus; var newAnswersArray = [];
                for (var i=0; i<oldDataStatus_vals.length; i++) {
                    /* Populating array of newly submitted answers */
                    if (oldDataStatus_keys[i].indexOf("question") !== -1) {
                        newAnswersArray.push(newDataStatus_vals[i]);
                    };

                    /* Populating array of newly submitted registrationStatus object */
                    if (oldDataStatus_vals[i] != newDataStatus_vals[i]) {
                        var keyAffected = newDataStatus_keys[i];
                        var valAffected = newDataStatus_vals[i];

                        var statusKey = (oldDataStatus_keys[i].indexOf("question") !== -1) ? oldDataStatus_keys[i] : keyAffected;
                        var statusVal = (valAffected) ? "true" : "false";
                        newStatusObj[statusKey] = statusVal;
                    }
                }

                /* Rendering new questionnaire object */                
                var newQuestionnaireObj = oldDataQuestionnaire;
                for (var i=0; i<oldDataAnswersArray.length; i++) {
                    if (oldDataAnswersArray[i] != newAnswersArray[i]) {
                        var obj = {};
                        obj.key = oldDataKeysArray[i];
                        obj.question = oldDataQuestionsArray[i];
                        obj.answer = newAnswersArray[i];
                        newQuestionnaireObj[i] = obj;
                    }
                }

                /* Get Recommended Demos for Attendee based on Job Title and Interest */
                var attendeeJobTitle = response.title;
                var recommendedDemos = getRecommendedDemosForAttendee(attendeeJobTitle, newQuestionnaireObj);

                /* Creating Object to combine and return data, used to properly chain function calls */
                var newData = {
                    registrationStatus: newStatusObj,
                    questionnaire: newQuestionnaireObj,
                    recommendedDemos: recommendedDemos
                };
                return newData;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Call to update db */
    var updateRegistrationStatus = function (data) {
        return AttendeeModel.findOneAndUpdate(
            {badgeNumber: attendeeObj.badgeNumber},
            {
                $set: {
                    "registrationStatus": data.registrationStatus,
                    "questionnaire": data.questionnaire,
                    "recommendedDemos": data.recommendedDemos,
                    "hasSeenRegistrationRequest": "true"
                }
            },
            {upsert: false, new: true}
        ).exec();
    };
    
    /* Chaining promises together */
    return parseAttendeeDetails()
        .then(updateRegistrationStatus)
        .then(function (data) {
            return data;
        });
};



var postAttendeeDemo = function (data) {

    var badgeId = data.badgeId;
    var dataDemo = data.demo;

    /* Get a list of IDs of Demos that have already been viewed by Attendee */
    var getAttendeeDemoViews = function () {
        return getAttendeeByBadgeId(badgeId)
            .then(function (attendee) {
                return attendee.demos;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /** 
     * Update Demo views by Attendee 
     * CASE 1: Has dataDemo
     *     CASE 1.A: Attendee Has viewedDemos
     *         CASE 1.A.i: dataDemo requires Check Out
     *             CASE 1.A.i.a: dataDemo has occurred in viewedDemos
     *                            - Set dataDemo.checkedIn = true
     *                            - Set dataDemo.checkedOut = true
     *                 CASE 1.A.i.a.1: Last occurance of dataDemo in viewedDemos was Checked Out
     *                                  - Push dataDemo into Attendee object
     *                 CASE 1.A.i.a.2: Last occurance of dataDemo in viewedDemos was NOT Checked Out
     *                     CASE 1.A.i.a.2.A: dataDemo is the last element in viewedDemos
     *                                        - Push dataDemo into Attendee object              
     *                                        - Increment attendee.pointAccumulated             
     *                                        - Increment attendee.pointsCount
     *                     CASE 1.A.i.a.2.A: dataDemo is NOT the last element in viewedDemos
     *                                        - Set dataDemo.checkedIn = true
     *                                        - Set dataDemo.checkedOut = false
     *                                        - Push dataDemo into Attendee object              
     *              CASE 1.A.i.b: dataDemo has NOT occurred in viewedDemos
     *                                          - Set dataDemo.checkedIn = true
     *                                          - Set dataDemo.checkedOut = false
     *                                          - Push dataDemo into Attendee object
     *          CASE 1.A.ii: dataDemo does NOT require Check Out
     *              CASE 1.A.ii.1: dataDemo has occurred in viewedDemos
     *                              - Push dataDemo into Attendee object  
     *              CASE 1.A.ii.2: dataDemo has NOT occurred in viewedDemos
     *                              - Push dataDemo into Attendee object    
     *                              - Increment attendee.pointAccumulated             
     *                              - Increment attendee.pointsCount          
     *      CASE 1.B: Attendee does NOT have any viewedDemos
     *          CASE 1.B.i: dataDemo requires Check Out
     *                          - Set dataDemo.checkedIn = true
     *                          - Set dataDemo.checkedOut = false
     *                          - Push dataDemo into Attendee object
     *          CASE 1.B.ii: dataDemo does NOT require Check Out
     *                          - Push dataDemo into Attendee object              
     *                          - Increment attendee.pointAccumulated             
     *                          - Increment attendee.pointsCount 
     * return dataDemo   
     * 
     * CASE 2: Does not have dataDemo
     *      - Redirect to screen saying "A Demo has not been assigned to this Station yet"      
     **/
    var updateAttendeeDemoViews = function (viewedDemos) {

        /* CASE 2 - from algorithm above */
        if (!dataDemo || !dataDemo._id) {
            return Attendee.getAttendeeByBadgeId(badgeId)
                .then(function (attendee) {
                    console.log("Attendee.js says: postAttendeeDemo() - updateAttendeeDemoViews() -> No demo in demo station, so returning attendee");
                    return attendee;
                });
        }

        /* CASE 1 - from algorithm above */
        if (viewedDemos && viewedDemos.length) { /* If Attendee has some viewed Demos */
                            
            var viewedDemoIds = viewedDemos.map(function (viewedDemo) {
                return viewedDemo._id;
            });

            if (dataDemo.requireCheckout == "true") {
                if (viewedDemoIds.indexOf(dataDemo._id) != -1) { /* If dataDemo has occurred in viewedDemos */  
                        
                    dataDemo.checkedIn = "true";
                    dataDemo.checkedOut = "true";

                    /* Getting the last logged Demo object for Attendee that matches dataDemo ID */
                    var attendeeLastDataDemoOccurance = JSON.parse(JSON.stringify(viewedDemos));
                    attendeeLastDataDemoOccurance = attendeeLastDataDemoOccurance.reverse().find(function (row) {
                        return row._id = dataDemo._id;
                    });

                    /* Getting the last logged demo object for Attendee */
                    var attendeeLastViewedDemo = viewedDemos[viewedDemos.length - 1];
                    
                    if (attendeeLastDataDemoOccurance.checkedOut == "true") { /* Last occurance of dataDemo in viewedDemos was Checked Out */                   
                        return AttendeeModel.findOneAndUpdate(                                
                            {badgeNumber: badgeId},
                            {
                                $push: {
                                    demos: dataDemo
                                }
                            },
                            {new: true}
                        ).exec();
                    } else {
                        if (attendeeLastDataDemoOccurance._id == attendeeLastViewedDemo._id) { /* If dataDemo is the last element in viewedDemos */
                            return AttendeeModel.findOneAndUpdate(
                                {badgeNumber: badgeId},
                                {
                                    $push: {
                                        demos: dataDemo
                                    },
                                    $inc: {
                                        pointsCount: dataDemo.points,
                                        pointsAccumulated: dataDemo.points
                                    }
                                },
                                {new: true}
                            ).exec();
                        } else {
                            dataDemo.checkedIn = "true";
                            dataDemo.checkedOut = "false";                    
                            return AttendeeModel.findOneAndUpdate(                                
                                {badgeNumber: badgeId},
                                {
                                    $push: {
                                        demos: dataDemo
                                    }
                                },
                                {new: true}
                            ).exec();
                        }
                    }
                } else { /* If dataDemo has NOT occurred in viewedDemos */
                    dataDemo.checkedIn = "true";
                    dataDemo.checkedOut = "false";                    
                    return AttendeeModel.findOneAndUpdate(                                
                        {badgeNumber: badgeId},
                        {
                            $push: {
                                demos: dataDemo
                            }
                        },
                        {new: true}
                    ).exec();
                }
            } else {
                return AttendeeModel.findOneAndUpdate(
                    {badgeNumber: badgeId},
                    {
                        $push: {
                            demos: dataDemo
                        },
                        $inc: {
                            pointsCount: dataDemo.points,
                            pointsAccumulated: dataDemo.points
                        }
                    },
                    {new: true}
                ).exec();
            }
        } else { /* If Attendee does NOT have any viewedDemos */
            if (dataDemo.requireCheckout == "true") { /* If dataDemo requires Check Out */
                dataDemo.checkedIn = "true";
                dataDemo.checkedOut = "false";                    
                return AttendeeModel.findOneAndUpdate(                                
                    {badgeNumber: badgeId},
                    {
                        $push: {
                            demos: dataDemo
                        }
                    },
                    {new: true}
                ).exec();
            } else { /* If dataDemo does NOT require Check Out */
                return AttendeeModel.findOneAndUpdate(
                    {badgeNumber: badgeId},
                    {
                        $push: {
                            demos: dataDemo
                        },
                        $inc: {
                            pointsCount: dataDemo.points,
                            pointsAccumulated: dataDemo.points
                        }
                    },
                    {new: true}
                ).exec();
            }
        }
    }

    /* Chain promises together in final function calls */
    return getAttendeeDemoViews()
        .then(updateAttendeeDemoViews);

};



var postAttendeeRedemptions = function (badgeNumber, prizeInfo) {
    var prizeObj = JSON.parse(JSON.stringify(prizeInfo));
    delete prizeObj.imageKey;
    delete prizeObj.inventory;
    delete prizeObj.redemptions;

    return AttendeeModel.update(
        {badgeNumber: badgeNumber},
        {
            $push: {
                redemptions: prizeObj
            },
            $inc: {
                pointsCount: -prizeObj.points
            } 
        }
    )
    .then(function (data) {
        return data;
    })
    .catch(function (error) {
        throw error;
    });
};



var postAttendeeExtraQuestionnaire = function (badgeNumber, questionnaireArray) {
    if (!badgeNumber) {
        console.log("Must provide Badge Number");
        throw "Must provide Badge Number";
    }

    return AttendeeModel.findOneAndUpdate(
        {badgeNumber: badgeNumber},
        {
            $set: {
                extraQuestionnaire: questionnaireArray
            }
        },
        {new: true}
    ).exec();
};



var flagAttendeeHasSeenRegistrationRequest = function (badgeId) {
    return AttendeeModel.findOneAndUpdate(
        {badgeNumber: badgeId},
        {
            $set: {
                hasSeenRegistrationRequest: "true"
            }
        },
        {new: true}
    ).exec();
};



var deleteByBadgeId = function (badgeId) {
    return AttendeeModel.remove(
        {badgeNumber: badgeId},
        function (err, data) {
            return data;
        }
    ).exec();
};



/**
 * Create Object with all member functions
 */
Attendee = {
    getAllAttendees: getAllAttendees,
    getAttendeeById: getAttendeeById,
    getAttendeeByBadgeId: getAttendeeByBadgeId,
    postAttendee: postAttendee,
    postAttendeeRegistrationStatus: postAttendeeRegistrationStatus,
    postAttendeeDemo: postAttendeeDemo,
    postAttendeeRedemptions: postAttendeeRedemptions,
    postAttendeeExtraQuestionnaire: postAttendeeExtraQuestionnaire,
    deleteByBadgeId: deleteByBadgeId,
    flagAttendeeHasSeenRegistrationRequest: flagAttendeeHasSeenRegistrationRequest
};


/**
 * Export Module
 */
module.exports = Attendee;





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

    /* A list of all recommendable Demo Spots */
    var allRecommendableDemos = 
    [
        5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32
    ];

    /* Access 'jobTag' using: 'jobTag[jobTitle]' */
    var jobTag = 
    {
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
        "Technical Artist":     "TA",


        /* Dummy ValUES */
        "Data Network Consultant":      "DN",
        "Director Product Marketing":   "DP",
        "Client Manager":               "CM",
        "Senior Account Executive":     "SA"
    };

    /* Access 'interestsTags' using 'interestsTags[interest]' */
    var interestsTags = 
    {
        "Analytics (Game, Server)":         "AN",       /* " (Game, Ser...)"  <-  The comma is a problematic issue, becasue strings are broken down by the commas. Consider asking front end to send JSON instead of string */
        "Audio Arts":                       "AA",
        "Cloud Services":                   "CS",
        "Console/Mobile Market":            "CM",
        "Developer Engineering":            "DE",
        "Game Monetization":                "GM",
        "Get Investors":                    "GI",
        "Launch Practices":                 "LP",
        "Market Distribution":              "MD",
        "Marketing/Media Influencers":      "MM",
        "Middleware Tools":                 "MT",
        "Multiplayer Support":              "MP",
        "Network Protection/Tolerance":     "NP",
        "Reliable Global Scaling":          "RG",
        "Services Deployment":              "SD",
        "Testing Lifecycle":                "TL",
        "Training/Education/Student":       "TE",
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
        LD: [5,7,8],
        PR: [29],
        QA: [14,17,30],
        SM: [11,18,25,27,26,28,20,22,13,19,23,31,32],
        TA: [5,6,7,8,19],


        
        /* Dummy Values */
        DN: [2,3,3,17],
        DP: [1],
        CM: [2,3,4,5,6,7,8,9,12],
        SA: [16,22,30]
    };
    
    /* Table to get Demo Spot nubmer by Interest */
    var demoValByInterests = 
    {
        AA: [25,20,22,13],
        AN: [27,28,19,23,29],
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
    var productLifeCycleValueMap = 
    {
        "Evaluation":           1,
        "Content/Prototype":    2,
        "PreProduction":        3,
        "Alpha Production":     4,
        "Beta Production":      5,
        "Early Access":         6,
        "Launch":               7,
        "Feedback testing":     8,
        "Live Operations":      9,
        "Global Expansion":     10,
        "Sunset/End of Life":   11
    };


    /* Getting tag for Attendee's job title. */
    jobTitle = jobTitle.trim();
    var attendeeJobTag = jobTag[jobTitle];
    if (!attendeeJobTag) {
        console.log("Error: Invalid Job Title: " + jobTitle);
        throw "Error: Invalid Job Title";
    }

    /* Extracting Attendee's interests from 'questionnaire' object. Returns an array of interest tags. */
    var interests = questionnaire.find(function (question) {
        return question.key == "interests";
    });
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

    /* Get the demos that have been weighted more than 0 */
    var demosWeightedAboveZero = uniqueDemoWeightsForAllLifeCycles.map(function (demo) {
        if (demo.weight > 0) {
            return demo;
        }
    }); 

    var topSixRecommendedDemos = demosWeightedAboveZero.map(function (demo) {
        return demo.demoSpot;
    }).slice(0, 6);

    if (demosWeightedAboveZero.length < 6) {
        var demosWeightedAboveZero_demoSpots = demosWeightedAboveZero.map(function (demo) {
            return demo.demoSpot;
        });

        var demosNotRecommendedToAttendee = allRecommendableDemos.filter(function (demo) {
            return demosWeightedAboveZero_demoSpots.indexOf(demo) == -1;
        });

        shuffle(demosNotRecommendedToAttendee);

        var additionalDemosRequiredCount = 6 - demosWeightedAboveZero_demoSpots.length;
        var additionalDemos = demosNotRecommendedToAttendee.slice(0, additionalDemosRequiredCount);
        additionalDemos.map(function (demo) {
            topSixRecommendedDemos.push(demo);
        });
    }
    
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
        "11"    :   "1-6",
        "12"    :   "1-10",
        "14"    :   "1-6",
        "9"     :   "4-10",
        "5"     :   "1-4",
        "6"     :   "1-4",
        "7"     :   "1-4",
        "8"     :   "1-4",
        "10"    :   "5-10",
        "4"     :   "0-0",
        "21"    :   "1-5",
        "31"    :   "1-4",
        "30"    :   "1-4",
        "1"     :   "0-0",
        "2A"    :   "0-0",
        "2B"    :   "0-0",
        "3"     :   "0-0",
        "16"    :   "4-9",
        "15"    :   "6-9",
        "18"    :   "5-9",
        "17"    :   "5-10",
        "25"    :   "5-10",
        "27"    :   "5-10",
        "26"    :   "6-10",
        "24"    :   "5-10",
        "28"    :   "6-10",
        "20"    :   "6-9",
        "22"    :   "8-10",
        "13"    :   "6-10",
        "19"    :   "6-10",
        "23"    :   "7-10",
        "29"    :   "8-9",
        "32"    :   "1-4"
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
     *          - Range all lifecycle values in between from '< 1.0 to ' 0.8'
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