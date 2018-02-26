var app = angular.module("app", ["ngAnimate", "ui.router", "anim-in-out"]);


app.service("authorize", function ($http) {
    this.getSession = function (callback) {
        $http.get("/api/session")
            .then(function (response) {
                callback(response);
            })
            .catch(function (err) {
                throw err;
            });
    };
});



app.config(["$stateProvider", "$urlRouterProvider", '$locationProvider', 'authorizeProvider', '$httpProvider',
function (
    $stateProvider,
    $urlRouterProvider,
    $locationProvider,
    authorizeProvider,
    $httpProvider
) {

    $stateProvider
        .state("login", {
            url: "/login",
            controller: "LoginController",
            templateUrl: "views/partials/login.html"
        })
        .state("demos", {
            url: "/demos",
            controller: "DemoController",
            templateUrl: "views/partials/demos.html"
        })
        .state("demo/*", {
            url: "/demo/:demoId",
            controller: "DemoController",
            templateUrl: "views/partials/demos.html"
        })
        .state("demoStations", {
            url: "/demoStations",
            controller: "DemoStationController",
            templateUrl: "views/partials/demoStations.html"
        })
        .state("demoStation/*", {
            url: "/demoStations/:demoStationId",
            controller: "DemoStationController",
            templateUrl: "views/partials/demoStations.html"
        })
        .state("attendees", {
            url: "/attendees",
            controller: "AttendeeController",
            templateUrl: "views/partials/attendees.html"
        })
        .state("attendee/*", {
            url: "/attendee/:attendeeId",
            controller: "AttendeeController",
            templateUrl: "views/partials/attendees.html"
        })
        .state("prizes", {
            url: "/prizes",
            controller: "PrizeController",
            templateUrl: "views/partials/prizes.html"
        })
        .state("prize", {
            url: "/prize/:prizeId",
            controller: "PrizeController",
            templateUrl: "views/partials/prizes.html"
        })
        .state("home", {
            url: "/home",
            controller: "HomeController",
            templateUrl: "views/partials/home.html"
        });

    $urlRouterProvider.otherwise(function ($injector, $location) {
        var $state = $injector.get('$state');
        $state.go("home", {
            title: "Dashboard",
            message: "Login Successful!"
        });
    });

    $locationProvider.html5Mode(true);
}]);



app.run(['authorize', '$state', '$rootScope', '$stateParams', function (authorize, $state, $rootScope, $stateParams, $http) {
    authorize.getSession(function (data) {
        var user = data.data;
        $rootScope.user = user;
        if (user) {
            $rootScope.$state = $state;
        } else {
            $state.go("login", {
                title: "Login",
                message: "Please login with your credentials"
            });
        }
    });
}]);










