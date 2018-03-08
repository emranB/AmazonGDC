var express = require('express');
var router = express.Router();

var demoExports = require('../API/demo');
var demoStationExports = require('../API/demoStation');
var prizeExports = require('../API/prize');
var attendeeExports = require('../API/attendee');
var sessionExports = require('../API/session');


/* Demos */
router.route('/demos').get(demoExports.allDemos);
// router.route('/demos/attendeeBadgeId/:badgeId').get(demoExports.getDemosByAttendeeBadgeId);
router.route('/demo/id/:_id').get(demoExports.demoById);
router.route('/demo/title/:title').get(demoExports.demoByTitle);
router.route('/demo').post(demoExports.saveDemo);

/* Demo Stations */
router.route('/demoStations').get(demoStationExports.allDemoStations);
router.route('/demoStation/id/:_id').get(demoStationExports.demoStationbyId);
router.route('/demoStation/piId/:id').get(demoStationExports.demoStationbyPiId);
router.route('/demoStation/demoId/:id').get(demoStationExports.demoStationByDemoId);
router.route('/demoStation').post(demoStationExports.saveDemoStation);

/* Prizes */
router.route('/prizes').get(prizeExports.allPrizes);
router.route('/prize/id/:_id').get(prizeExports.prizeById);
router.route('/prize/demoId/:title').get(prizeExports.prizeByTitle);
router.route('/prize').post(prizeExports.savePrizeCreate);
router.route('/prize/id/:prizeId/attendee/:badgeId/redemption').post(prizeExports.savePrizeRedemptions);

/* Attendee */
router.route('/attendees').get(attendeeExports.attendees);
router.route('/attendee/id/:id').get(attendeeExports.attendeeById);
router.route('/attendee/badgeId/:id').get(attendeeExports.attendeeByBadgeId);
router.route('/attendee').post(attendeeExports.saveAttendee);
router.route('/attendee/badgeId/:id/registrationStatus').post(attendeeExports.saveAttendeeRegistrationStatus);
router.route('/attendee/badgeId/:badgeId/demo/:demoId').post(attendeeExports.saveAttendeeDemo);
/**/ router.route('/attendee/logDemoByDemoStation').post(attendeeExports.saveAttendeeDemoByPiId); 
router.route('/attendee/badgeId/:badgeId/redeemPrize/:prizeId').post(attendeeExports.redeemPrize);

/* Session */
router.route('/session').post(sessionExports.authorizeUser);
router.route('/session').get(sessionExports.getSession);
router.route('/session/authorize/rfid').post(sessionExports.authorizeUserByRfid);
router.route('/logout').get(sessionExports.destroySession);




module.exports = router;
