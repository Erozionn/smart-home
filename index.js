
 
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
var async            = require("async");
var mqtt             = require('mqtt')
var users            = {};

//Connect to DB.
var con;

function handleDisconnect() {
    con = mysql.createConnection(info.mysql); // Recreate the connection, since
                                                  // the old one cannot be reused.

    con.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
        con.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();


require('./config/passport')(passport, functions, con, users)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(bodyParser.json()); // for parsing application/json
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session(info.passport)); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session





// routes ======================================================================
require('./routes.js')(app, passport, express, isReachable, url, request, bodyParser,
     empty, nmap, io, con, functions, info, users, async, mqtt);//, passportSocketIo, cookieParser, session); // load our routes and pass in our app and fully configured passport



//State of smarthome devices


// launch ======================================================================
server.listen(port);
console.log('Smart home system started on port: ' + port);