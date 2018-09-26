
 
var express          = require('express');
var app              = express();
var server           = require('http').Server(app);
var port             = process.env.PORT || 8080;
var path           = require('path');

var passport         = require('passport');
var flash            = require('connect-flash');
var morgan           = require('morgan');
var cookieParser     = require('cookie-parser');
var session          = require('express-session');

var url              = require("url");
var request          = require('request');
var bodyParser       = require('body-parser');
var empty            = require("is-empty");
var nmap             = require('node-nmap');
nmap.nmapLocation    = "nmap"; //default

var io               = require('socket.io')(server);
//var passportSocketIo = require("passport.socketio");
var isReachable      = require('is-reachable');
var mysql            = require('mysql');
var functions        = require('./lib/functions');
var info             = require('./config/hiddenInfo')

require('./config/passport')(passport, functions)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(bodyParser.json()); // for parsing application/json
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session(info.passport)); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//Connect to DB.
var con = mysql.createConnection(info.mysql);



// routes ======================================================================
require('./routes.js')(app, passport, express, isReachable, url, request, bodyParser, empty, nmap, io, con, functions, info);//, passportSocketIo, cookieParser, session); // load our routes and pass in our app and fully configured passport



//State of smarthome devices


// launch ======================================================================
server.listen(port);
console.log('Smart home system started on port: ' + port);