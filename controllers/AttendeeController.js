(function () {
    
    app.controller('AttendeeController', ['$state', '$scope', '$http', '$stateParams',
    function (
        $state,
        $scope,
        $http,
        $stateParams
    ) {
        
        $scope.attendees = [];
        $scope.showAttendees = false;
        $scope.createAttendee = false;
        $scope.showExtended = false;
        $scope.header = {
            title: "Attendees",
            subTitle: "Select an option below"
        };
        $scope.errorMessage = {
            show: false,
            title: '',
            description: []
        };
    
        $scope.pageOptions = [
            {
                title: "Show Attendees",
                description: "Get a list of all Attendees",
                action: function () {
                    return getAllAttendees()
                        .then(function () {
                            $scope.header.subTitle = "List of all Attendees";
                            $scope.showAttendees = true;
                            $scope.createAttendee = false;
                        });
                }
            },
            {
                title: "Register Attendee",
                description: "Register a new Attendee",
                action: function () {
                    $scope.header.subTitle = "Create a new Attendee";
                    $scope.showAttendees = false;
                    $scope.createAttendee = true;
                }
            }
        ];
        
    
        /* Get all demos */
        var getAllAttendees = function () {
            var attendeeId = $stateParams.attendeeId;
    
            if (attendeeId == "" || attendeeId == undefined) {
                return $http.get("/api/attendees")
                    .then(function (data) {
                        $scope.attendees = [];
                        var attendees = data.data;
                        $scope.attendees = attendees;
                        $scope.showAttendees = true;

                        if ($scope.attendees.length == 0) {
                            $scope.errorMessage = {
                                show: true,
                                title: "Error: No records to show",
                                description: [
                                    "No Attendees were found in our records",
                                    "You can add Attendees using the 'Create Demo' feature"
                                ]
                            };
                        }

                    });
            } else {
                return $http.get("/api/attendee/id/" + attendeeId)
                    .then(function (data) {
                        $scope.attendees = [];
                        var attendee = data.data;
                        $scope.header.subTitle = attendee.firstName + " " + attendee.lastName;
                        $scope.attendees.push(attendee);
                        $scope.showExtended = true;
                    });
            }
        };
    
    
        /* Function fired on page load */
        var loadPage = function () {
            var attendeeId = $stateParams.attendeeId;

            if (attendeeId != "" && attendeeId != undefined) {
                return getAllAttendees()
                    .then(function () {
                        $scope.showAttendees = true;
                        $scope.createAttendee = false;
                    });
            }
        };
        loadPage();
    

        /* Register new Attendee */
        $scope.registerNewAttendee = function () {
            /*************** Params ***************/
            var activationCode = "4186598";
            var authKey = "CurrentStudios_1";
            var deviceIdentifier = "Test";
            var NdefRec = "OTk5MzMeMTc0MR9Nci4fZmlyc3RuYW1lIDkzNB9sYXN0bmFtZSA5MzQfbWlkZGxlbmFtZSA5MzQfU3IuH+fW8wJ8xWcr7HzUSE4gM+GtKRoJ7zce6UTeNEXozPsS1gJmbRlSluha5fHAGrkIY/5xnDjqGnwrDEDdVW7mrYmeLmLn8D8PXV7Ke9Sp6LqTivHl+TlEWeTD+5kTT40TztgCKeQhGJ9PXRaS2SslZDNi01tlxwXrTPllvZG2Bp2dDYm46Tmbhs3d/0xDHuJVP+nZAM5Craf4kEAODtANWHrPaQOdMV9dhIKItpQtZVjNNUY4hjtpa3HJ1TBBvRaMh6nPjbBqBtXmOqQ7mNjF6Ci0viPa1GXydrlYrAgWMtvcp83MV+i6WZzTgRExdJlqVDiqE04EhlJ6UkNRrsk+MG6EUB3ZFWGvZA==";
            /**************************************/

            var params = {
                ActivationCode: activationCode,
                AuthKey: authKey,
                DeviceIdentifier: deviceIdentifier,
                NdefRecord: NdefRec
            };

            return $http.post("/api/session/authorize/rfid", params)
                .then(function (response) {
                    console.log(response);
                });
        };

        
        /* Logout User */
        $scope.logout = function () {
            if (confirm("Are you sure you want logout?")) {
                return $http.get("/api/logout")
                    .then(function (response) {
                        $state.go("login");
                    });
            }
        };
    
        
    }]);
        
        
    })();
    
    