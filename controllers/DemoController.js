(function () {
    
app.controller('DemoController', ['$state', '$scope', '$http', '$stateParams',
function (
    $state,
    $scope,
    $http,
    $stateParams
) {
    
    $scope.demos = [];
    $scope.showDemos = false;
    $scope.createDemo = false;
    $scope.showExtended = false;
    $scope.header = {
        title: "Demos",
        subTitle: "Choose an option below"
    };
    $scope.errorMessage = {
        show: false,
        title: '',
        description: []
    };
    $scope.editingDemo = false;

    $scope.pageOptions = [
        {
            title: "Show Demos",
            description: "Get a list of all Demos",
            action: function () {
                return getAllDemos()
                    .then(function () {
                        $scope.showDemos = true;
                        $scope.createDemo = false;
                    });
            }
        },
        {
            title: "Create Demo",
            description: "Create a new Demo",
            action: function () {
                $scope.header.subTitle = "Create a new Demo";
                $scope.showDemos = false;
                $scope.createDemo = true;
            }
        }
    ];
    

    /* Get all demos */
    var getAllDemos = function () {
        var demoId = $stateParams.demoId;

        if (demoId == "" || demoId == undefined) {
            return $http.get("/api/demos")
                .then(function (data) {
                    $scope.demos = [];
                    var demos = data.data;
                    $scope.demos = demos;
                    $scope.showDemos = true;
                    $scope.header.subTitle = "Showing all Demos";

                    if ($scope.demos.length == 0) {
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
            return $http.get("/api/demo/id/" + demoId)
                .then(function (data) {
                    $scope.demos = [];
                    var demo = data.data;
                    $scope.header.subTitle = demo.title;
                    $scope.demos.push(demo);
                    $scope.showExtended = true;
                });
        }
    };


    var loadPage = function () {
        var demoId = $stateParams.demoId;
        if (!demoId == "" || !demoId == undefined) {
            return getAllDemos()
                .then(function () {
                    $scope.showDemos = true;
                    $scope.createDemo = false;
                });
        }
    };
    loadPage();


    $scope.deleteDemo = function (demoId) {
        if (confirm("Are you sure you want to delete this Demo?")) {
            return $http.delete("/api/demo/" + demoId)
                .then(function (response) {
                    $scope.showDemos = false;
                    $state.go("demos");
                });
        }
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

