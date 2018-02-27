/** 
 * Connection 
 **/
var mongoose = require('mongoose');
var uri = 'mongodb://localhost:27017/amazon_gdc';
var connection = mongoose.connect(uri);


/* Points rewarded for viewing a single Demo*/
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
    pointsAccumulated: Number,
    pointsCount: Number,
    redemptions: Object,
    extraQuestionnaire: String
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
            return AttendeeModel.update(
                {badgeNumber: attendeeData.badgeNumber},
                attendeeData,
                {upsert: true}
            )
            .then(function (data) {
                return data;
            })
            .catch(function (error) {
                throw error;
            });
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
                var oldDataStatus = response.registrationStatus;oldDataStatus_vals.length;
                var oldDataStatus_keys = Object.keys(oldDataStatus);
                var oldDataStatus_vals = Object.keys(oldDataStatus).map(function (key) {
                    return oldDataStatus[key];
                });
                /* Extracting answers that are currently existing in db */
                var oldDataQuestionnaire = response.questionnaire;
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
                        var statusVal = (valAffected.trim()) ? "true" : "false";
                        newStatusObj[statusKey] = statusVal;
                    }
                }

                /* Rendering new questionnaire object */                
                var newQuestionnaireObj = oldDataQuestionnaire;
                for (var i=0; i<oldDataAnswersArray.length; i++) {
                    if (oldDataAnswersArray[i] != newAnswersArray[i]) {
                        var obj = {};
                        obj.question = oldDataQuestionsArray[i];
                        obj.answer = newAnswersArray[i];
                        newQuestionnaireObj[i] = obj;
                    }
                }

                /* Creating Object to combine and return data, used to properly chain function calls */
                var newData = {
                    registrationStatus: newStatusObj,
                    questionnaire: newQuestionnaireObj
                };
                
                return newData;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Call to update db */
    var updateRegistrationStatus = function (data) {
        return AttendeeModel.update(
            {badgeNumber: attendeeObj.badgeNumber},
            {
                $set: {
                    "registrationStatus": data.registrationStatus,
                    "questionnaire": data.questionnaire
                }
            },
            {upsert: false}
        )
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            throw error;
        });
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
    var demo = data.demo;

    /* Get a list of IDs of Demos that have already been viewed by Attendee */
    var getAttendeeDemoViews = function () {
        return getAttendeeByBadgeId(badgeId, "demos")
            .then(function (demos) {
                var demoIds = demos.map(function (demo) {
                    return demo._id.toString();
                });
                return demoIds;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Update Demo views by Attendee */
    var updateAttendeeDemoViews = function (viewedDemoIds) {
        var viewingDemoId = demo._id.toString();


        console.log(demo);
        throw 'stop333';


        if (viewedDemoIds.indexOf(viewingDemoId) == -1) {
            return AttendeeModel.update(
                {badgeNumber: badgeId},
                {
                    $push: {
                        demos: demo
                    },
                    $inc: {
                        pointsCount: DEMO_POINTS,
                        pointsAccumulated: DEMO_POINTS
                    }
                }
            )
            .then(function (response) {
                return response;
            })
            .catch(function (error) {
                throw error;
            });
        }
        // else {
        //     console.log("Demo has already been viewed by Attendee");
        //     return false;
        // }
    };

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
    postAttendeeRedemptions: postAttendeeRedemptions
    // postAttendeeExtraQuestionnaire: postAttendeeExtraQuestionnaire
};


/**
 * Export Module
 */
module.exports = Attendee;

