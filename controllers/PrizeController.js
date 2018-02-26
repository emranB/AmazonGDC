(function () {
    
    app.controller('PrizeController', ['$state', '$scope', '$http', '$stateParams',
    function (
        $state,
        $scope,
        $http,
        $stateParams
    ) {
        
        $scope.prizes = [];
        $scope.showPrizes = false;
        $scope.createPrize = false;
        $scope.showExtended = false;
        $scope.header = {
            title: "Prizes",
            subTitle: "Showing all Prizes"
        };
        $scope.errorMessage = {
            show: false,
            title: '',
            description: []
        };
    
        $scope.pageOptions = [
            {
                title: "Show Prizes",
                description: "Get a list of all Prizes",
                action: function () {
                    return getAllPrizes()
                        .then(function () {
                            $scope.showPrizes = true;
                            $scope.createPrize = false;
                        });
                }
            },
            {
                title: "Create Prize",
                description: "Create a new Prize",
                action: function () {
                    $scope.header.subTitle = "Create a new Prize";
                    $scope.showPrizes = false;
                    $scope.createPrize = true;
                }
            }
        ];
        
    
        /* Get all demos */
        var getAllPrizes = function () {
            var prizeId = $stateParams.prizeId;
    
            if (prizeId == "" || prizeId == undefined) {
                return $http.get("/api/prizes")
                    .then(function (data) {
                        $scope.prizes = [];
                        var prizes = data.data;
                        $scope.prizes = prizes;
                        $scope.showPrizes = true;
    
                        if ($scope.prizes.length == 0) {
                            $scope.errorMessage = {
                                show: true,
                                title: "Error: No records to show",
                                description: [
                                    "No Prizes were found in our records",
                                    "You can add Prizes using the 'Create Prize' feature"
                                ]
                            };
                        }
                    });
            } else {
                return $http.get("/api/prize/id/" + prizeId)
                    .then(function (data) {
                        $scope.prizes = [];
                        var prize = data.data;
                        $scope.header.subTitle = prize.title;
                        $scope.prizes.push(prize);
                        $scope.showExtended = true;
                    });
            }
        };
    
    
        var loadPage = function () {
            var prizeId = $stateParams.prizeId;
            if (!prizeId == "" || !prizeId == undefined) {
                return getAllPrizes()
                    .then(function () {
                        $scope.showPrizes = true;
                        $scope.createPrize = false;
                    });
            }
        };
        loadPage();
    
    
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
    
    