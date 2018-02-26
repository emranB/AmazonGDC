(function () {
    
    app.controller('HomeController', ['$state', '$scope', '$http', '$stateParams',
    function (
        $state,
        $scope,
        $http,
        $stateParams
    ) {
        
    
    
        // var loadPage = function () {
        //     var demoId = $stateParams.demoId;
        //     if (!demoId == "" || !demoId == undefined) {
        //         return getAllDemos()
        //             .then(function () {
        //                 $scope.showDemos = true;
        //                 $scope.createDemo = false;
        //             });
        //     }
        // };
        // loadPage();

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
    
    