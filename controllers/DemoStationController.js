(function () {
    
    app.controller('DemoStationController', ['$state', '$scope', '$http', '$stateParams',
    function (
        $state,
        $scope,
        $http,
        $stateParams
    ) {
        
        $scope.demoStations = [];
        $scope.demos = [];
        $scope.showDemoStations = false;
        $scope.createDemoStation = false;
        $scope.showExtended = false;
        $scope.header = {
            title: "Demo Stations",
            subTitle: "Select an option below"
        };
        $scope.errorMessage = {
            show: false,
            title: '',
            description: []
        };
    
        $scope.pageOptions = [
            {
                title: "Show Demo Stations",
                description: "Get a list of all Demo Stations",
                action: function () {
                    return getAllDemoStations()
                        .then(function () {
                            $scope.showDemoStations = true;
                            $scope.createDemoStation = false;
                        });
                }
            },
            {
                title: "Create Demo Station",
                description: "Create a new Demo Station",
                action: function () {
                    $scope.header.subTitle = "Create a new Demo Station";
                    $scope.showDemoStations = false;
                    $scope.createDemoStation = true;
                }
            }
        ];
        
    
        /* Get a list of all Demo Stations */
        var getAllDemoStations = function () {
            var demoStationId = $stateParams.demoStationId;
    
            if (demoStationId == "" || demoStationId == undefined) {
                return $http.get("/api/demoStations")
                    .then(function (data) {
                        $scope.demoStations = [];
                        var demoStations = data.data;
                        $scope.demoStations = demoStations;
                        $scope.showDemoStations = true;
    
                        if ($scope.demoStations.length == 0) {
                            $scope.errorMessage = {
                                show: true,
                                title: "Error: No records to show",
                                description: [
                                    "No Demos were found in our records",
                                    "You can add Demos using the 'Create Demo' feature"
                                ]
                            };
                        }

                    });
            } else {
                return $http.get("/api/demoStation/id/" + demoStationId)
                    .then(function (data) {
                        $scope.demoStations = [];
                        var demoStation = data.data;
                        $scope.header.subTitle = "Affiliated Demo: " + demoStation.demo.title;
                        $scope.demoStations.push(demoStation);
                        $scope.showExtended = true;

                        if ($scope.demoStations.length == 0) {
                            $scope.errorMessage = {
                                show: true,
                                title: "Error: No records to show",
                                description: [
                                    "No Demos were found in our records",
                                    "You can add Demos using the 'Create Demo' feature"
                                ]
                            };
                        }

                    });
            }
        };

        /* Get a list of all available Demos */
        var getAllDemos = function () {
            return $http.get("/api/demos")
                .then(function (data) {
                    $scope.demos = data.data;
                    return $scope.demos;
                });
        };
    
        /* Function fired on Page Load */
        var loadPage = function () {
            var demoStationId = $stateParams.demoStationId;
            if (demoStationId != "" && demoStationId != undefined) {
                return getAllDemoStations()
                    .then(getAllDemos)
                    .then(function () {
                        $scope.showDemoStations = true;
                        $scope.createDemoStation = false;
                    });
            } else {
                getAllDemos();
            }
        };
        loadPage();

        /* Create a new Demo Station */
        $scope.submitNewDemoStation = function (demo) {
            return $http.post("/api/demoStation", demo)
                .then(function (data) {
                    $state.reload();
                });
        };


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
    
    