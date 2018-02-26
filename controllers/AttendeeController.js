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
            var NdefRec = "MTY4Mh4xNzQxH01zLh9MZWUfSHVsbB9XHx/iNVJ8QJR5o5pmh4yy7CsHNwyHH09G9AzSrGIBVDZyj5DTaBcmwtiXiQZLZMMP4W5MrYGiBSa5imxKKrxYPAlbr99FO+w2hBrCr/FM1TLgZGpPYZpWio3z8DK+rtq4tjMxJwyT4xYXUsmBlMtOUDazPYeteTknVzy5kFkDurfpWgJv+0pnNED7p0iZsZNDOroGbEeGlqvSaH7KM8n+zkKnPnPq";
            /**************************************/
            /*************** Test Params ***************/
            // var activationCode = "156D3AE";
            // var authKey = "ITNTest";
            // var deviceIdentifier = "TestDevice";
            // var NdefRec = "MjA5NTA3HjE1OTcfH0d1aWRvH0dyaWVzZR8fH8YaabeGMB+e3IRpGv+RzbXat 14Jvht\/66mdSFt2xOkcBQOiJ9jTtaGw+mxcicDWNdtIAwgXBq\/W9\/rOOFIQNz2SjHxioUhjyNFvrgb9lstf 4DhTxcNw8E8Cv2D2FPQMIvxxOGv\/tEYN5UUiIPmWtDHFCi+PxTcrqUq9hTyxkzyI07FPEy8KiM5z2HQdu n+MTW+7MpNPveHl66HAlt1QJwXM3EuF4qA+Tt7z1Jmm6k7n";
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
        // $scope.registerNewAttendee();

        
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
    
    