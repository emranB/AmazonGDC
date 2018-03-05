var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('tracer').colorConsole();
var port = process.env.PORT || 2000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true 
}));

app.use(session(
    {
        secret: "secret", 
        resave: false, 
        saveUninitialized: true
    }
));

/* Handle Api Routing */
var routes = require('./routes/routes.js');
app.use('/api', routes);

/* Include Static scripts from client side once server side includes have completed */
app.use(express.static(__dirname + '/'));


/* Redirect all calls to 'index.html', and let Angular handle routing */
app.all('/*', function (req, res) {
    res.sendFile('views/index.html', {root: __dirname});
});

app.listen(port, "0.0.0.0", function (req, res) {
    console.log("Listening to port: " + port);
});

