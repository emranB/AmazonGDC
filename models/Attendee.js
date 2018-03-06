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

    console.log("------------------------------------------------------------------------------")
    console.log("------------------------------------------------------------------------------")
    console.log("In Attendee.js postAttendeeRegistrationStatus");
    console.log(attendeeObj);
    console.log("------------------------------------------------------------------------------")
    console.log("------------------------------------------------------------------------------")


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
            // console.log("------------------------------------------------------------------------");
            // console.log("In Attendee.js postAttendeeRegistrationStatus");
            // console.log(response);
            // console.log("------------------------------------------------------------------------");
            // console.log("------------------------------------------------------------------------");
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

    if (!demo) {
        demo = {};
    }

    /* Get a list of IDs of Demos that have already been viewed by Attendee */
    var getAttendeeDemoViews = function () {
        return getAttendeeByBadgeId(badgeId)
            .then(function (attendee) {
                if (!attendee.demos) {
                    attendee.demos = [];
                }
                return attendee.demos;
            })
            .catch(function (error) {
                throw error;
            });
    };

    /* Update Demo views by Attendee */
    var updateAttendeeDemoViews = function (viewedDemos) {
        demo = JSON.parse(JSON.stringify(demo));

        var viewedDemoIds = [];

        // data = badgeId + demo
        // console.log("------------------------------------------------------- ");
        // console.log("----------- Viewed Demos------------- ");
        // console.log(viewedDemos);
        // console.log("------------------------------------------------------- ");
        
        // !demo._id
        if (!demo || !demo._id) {
            return Attendee.getAttendeeByBadgeId(badgeId)
                .then(function (attendee) {
                    return attendee;
                });
        }

        if (!viewedDemos.length) {
            // return data.demo;
        }
        else {
            console.log("Has viewed demos");
            var viewedDemoIds = viewedDemos.map(function (viewedDemo) {
                return viewedDemo._id;
            });
            var viewingDemoId = demo._id;
        }
        

        console.log("Last demo occurs");
        var lastDemoOccurance = JSON.parse(JSON.stringify(viewedDemos));
        lastDemoOccurance = lastDemoOccurance.reverse().find(function (row) {
            return row._id = demo._id;
        });
        // console.log(lastDemoOccurance);



        demo.timeStamp = Date.now();
        /********************************************************************************************************************** 
         ** - Check if demo has "requireCheckout"
         **         IF demo has "requireCheckout"
         **             - Check if demo doesn't exist in Attendee Object
         **                 IF demo doesn't exist in Attendee Object
         **                     - Initiate demo object with new "checkedIn='true'" and "checkedOut='false'" fields
         **                     - Push demo into Attendee object
         **                       (DO NOT increment points here)
         **                 ELSE IF demo exists in Attendee Object
         **                     - Check if this Demo ID matches the ID of the last demo in the Attendee object
         **                         IF Demo IDs match
         **                             - Initiate current demo object with "checkedIn='true'" and "checkedOut='true'"
         **                             - Check if the last Demo in the Attendee object has "checkedOut='true'"
         **                                 IF the last Attendee object demo has "checkedOut='true'"
         **                                     - Push demo into Attendee object
         **                                 ELSE IF the last Attendee object demo has "checkedOut='false'"
         **                                     - Increment Attendee 'pointsCount' and 'pointsAccumulated'
         **                                     - Push demo into Attendee object
         **                         ELSE IF Demo IDs don't match 
         **                             - Initiate current demo object with "checkedIn='true'" and "checkedOut='false'"
         **                             - Push demo into Attendee object
         **********************************************************************************************************************/
        // && lastDemoOccurance.timeStamp >= (Date.now() + 5000)
        if (demo.requireCheckout == "true") {
            if (viewedDemoIds.indexOf(viewingDemoId) == -1) {   
                demo.checkedIn = "true";
                demo.checkedOut = "false";                     

                return AttendeeModel.findOneAndUpdate(
                    {badgeNumber: badgeId},
                    {
                        $push: {
                            demos: demo
                        }
                    },
                    {new: true}
                ).exec();
            } else {      
                
                var lastViewedDemo = viewedDemos[viewedDemos.length - 1];
                var lastViewedDemoId = viewedDemoIds[viewedDemoIds.length - 1];     
                var okTime = Date.now() + 25000;
                
                if ((viewingDemoId == lastViewedDemoId) && (okTime > lastViewedDemo.timeStamp)) {  
                    console.log("setting to truie");   
                    
                    demo.checkedIn = "true";
                    demo.checkedOut = "true";

                    if (lastViewedDemo.checkedOut == "true") {                    
                        return AttendeeModel.findOneAndUpdate(                                
                            {badgeNumber: badgeId},
                            {
                                $push: {
                                    demos: demo
                                }
                            },
                            {new: true}
                        ).exec();
                    } else {
                        return AttendeeModel.findOneAndUpdate(
                            {badgeNumber: badgeId},
                            {
                                $push: {
                                    demos: demo
                                },
                                $inc: {
                                    pointsCount: demo.points,
                                    pointsAccumulated: demo.points
                                }
                            },
                            {new: true}
                        ).exec();
                    }
                } else {
                    demo.checkedIn = "true";
                    demo.checkedOut = "false";  

                    return AttendeeModel.findOneAndUpdate(
                        {badgeNumber: badgeId},
                        {
                            $push: {
                                demos: demo
                            }
                        },
                        {new: true}
                    ).exec();
                }
            }
        }
        /************************************************************************** 
         ** ELSE IF does not have "requireCheckout"
         **     - Push Demo into Attendee object
         **     - Increment Attendee's 'pointsCount' and 'pointsAccumulated'
         **************************************************************************/
        else {
            return AttendeeModel.update(
                {badgeNumber: badgeId},
                {
                    $push: {
                        demos: demo
                    },
                    $inc: {
                        pointsCount: demo.points,
                        pointsAccumulated: demo.points
                    }
                },
                {new: true}
            ).exec();
            // .then(function (response) {
            //     return response;
            // })
            // .catch(function (error) {
            //     throw error;
            // });
        }
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

