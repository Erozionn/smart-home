// app/routes.js


rooms = {}




module.exports = function(app, passport, express, isReachable, url, request, bodyParser, empty, nmap, io, con, functions, info, users, async, mqtt, passportSocketIo, cookieParser, session) {
    // io.set('authorization', passportSocketIo.authorize({
    //     cookieParser: cookieParser,       // the same middleware you registrer in express
    //     key:          'connect.sid',       // the name of the cookie where express/connect stores its session_id
    //     secret:       'alexisthebest',    // the session_secret to parse the cookie
    //     store:        session,        // we NEED to use a sessionstore. no memorystore please
    //     success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
    //     fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
    //   }));
    
    //   function onAuthorizeSuccess(data, accept){
    //     console.log('successful connection to socket.io');
    //     accept();
    //   }
    
    //   function onAuthorizeFail(data, message, error, accept){
    //     if(error)
    //       throw new Error(message);
    //     console.log('failed connection to socket.io:', message);
    //     if(error)
    //       accept(new Error(message));
    //     // this error will be sent to the user as a special error-package
    //     // see: http://socket.io/docs/client-api/#socket > error-object
    //   }


// =====================================
// Initialize Rooms ====================
// =====================================

// for(var i = 0; i < Object.keys(info["rooms"]).length; i++){

//     var room_name = Object.keys(info["rooms"])[i];
//     rooms[Object.keys(info["rooms"])[i]] = {
//         ip: info["rooms"][room_name].ip
//     };
// }

var client  = mqtt.connect('mqtt://localhost')
 
client.on('connect', function () {

    for (var i = 0; i < Object.keys(info.rooms.tasmota).length; i++){
        var room_to_sub = Object.keys(info.rooms.tasmota)[i];
        client.subscribe(`stat/${room_to_sub}/RESULT`, function (err) {
    if (!err) {
        client.publish(`cmnd/${room_to_sub}/POWER`, "")
        client.publish(`cmnd/${room_to_sub}/Dimmer`, "")
        console.log("MQTT Subscribed")
    }
  })
    }
  
})

client.on('message', function (topic, message) {

    if (/^stat.*RESULT$/.test(topic)){
        var room = topic.split("/")[1];
        var result = JSON.parse(message);

        if (result["POWER"]){
            info.rooms.tasmota[room].state = result["POWER"];
        }

        if (result["Dimmer"]) {
            info.rooms.tasmota[room].bri = result["Dimmer"];
        }

        return;
    }
    

})

// =====================================
// Refresh Users =======================
// =====================================
var firstUserRefresh = true;
function refreshUsers(){
    con.query(`SELECT * FROM smart_home.users ORDER BY email`, function (err, result, fields) {
        if (err) throw err;
        //users = result;

        for (var i = 0; i < result.length; i++){

            if(empty(users[result[i]["email"]])){
                users[result[i]["email"]] = {};
            }


            users[result[i]["email"]]["email"] = result[i]["email"];
            users[result[i]["email"]]["first_name"] = result[i]["first_name"];
            users[result[i]["email"]]["last_name"] = result[i]["last_name"];
            users[result[i]["email"]]["address"] = result[i]["address"];
            users[result[i]["email"]]["api_key"] = result[i]["api_key"];

            if(firstUserRefresh){
                users[result[i]["email"]]["state"] = "offline";
                users[result[i]["email"]]["lastStateChange"] = Date.now();
                   
            }
            

        }
        //console.log(users);
        firstUserRefresh = false;
        whoIsOnline();
    });    
}

refreshUsers();
setInterval(function(){
    refreshUsers();
}, 300000)
    


    app.use('/main', express.static(__dirname + '/pages/main'));

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', isLoggedIn, function(req, res) {
        res.render('index.ejs', {
            data: 12, 
            localTemp: tempInfo,
            api_key: req.user.api_key,
            first_name: req.user.first_name
        }); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    //Google Authentication OAuth 2.0
    app.get('/auth/google',
    passport.authorize('google', { scope : ['profile', 'email'] }));

    app.get('/auth/google/callback',
    passport.authorize('google', {
        successRedirect : '/',
        failureRedirect : '/googleaccountfailed'
    }));

    app.get('/accountstatus', function(req, res) {

        // render the page and pass in any flash data if it exists
        //console.log(req.session.passport);
        if (typeof req.session.passport == "undefined"){
            console.log("UNDEFINED");
            res.render('accountstatus.ejs', { message: req.flash('signupMessage'), email: ""});
        } else {
            res.render('accountstatus.ejs', { message: req.flash('signupMessage'), email: req.session.passport.user.email});
        }
        
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.send({email: req.user.email, api_key: req.user.api_key, first_name: req.user.first_name, last_name: req.user.last_name, full_name: req.user.first_name + " " + req.user.last_name});
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    var deviceState = {
        "video" : "offline",
        "garage" : "offline",
        "database" : "offline"
    };
    
    //Face tracking var
    var faceTracking;
    
    //Indoor temp/humidity info
    var tempInfo = {temp: "23", humidity: "69"};
    
    //
    // var peopleState = {
    //     "online": {},
    //     "offline": {}
    // };
    
    var people = {
        "DC:EF:CA:DF:A3:04": {
            name: "alex",
            prettyName: "Alex"
        },
        "A0:C9:A0:95:0D:76": {
            name: "lorraine",
            prettyName: "Lorraine"
        },
        "92:FD:61:CA:D2:9D": {
            name: "steve",
            prettyName: "Steve"
        },
        "50:82:D5:BD:7E:31": {
            name: "erika",
            prettyName: "Erika"
        }
    }
    
    
    
    
    
    
    console.log("Performing system check...")   

    //Is garage online?
    isGarageOnline()
    function isGarageOnline(){
        isReachable('192.168.2.232:2334').then(function(reachable){
            console.log(reachable == true ? "[\x1b[32mONLINE\x1b[0m] Garage" : "[\x1b[31mOFFLINE\x1b[0m] Garage")
            if (reachable){
                deviceState["garage"] = "online";
            } else {
                deviceState["garage"] = "offline";
            }
            
        });    
    }
    
    
    con.connect(function(err) {
        deviceState["database"] = "online";
        console.log(err != true ? "[\x1b[32mONLINE\x1b[0m] Database" : "[\x1b[31mOFFLINE\x1b[0m] Database")
    });
    
    //Is video feed online?
    isVideoOnline(true);
    var cameraTimeout;
    function isVideoOnline(boot = false){
        isReachable('192.168.2.231:8080').then(function(reachable){
    
    
            console.log(reachable == true ? "[\x1b[32mONLINE\x1b[0m] Video feed" : "[\x1b[31mOFFLINE\x1b[0m] Video feed")
            
            if (reachable == false){
                clearTimeout(cameraTimeout);
                cameraTimeout = setTimeout(function(){
                    isVideoOnline();
                }, 300000);
                return;
            }
    
            if (reachable){
                deviceState["video"] = "online";
                if(boot){
                    io.on('connection', function(socket){
                        var faceOld = faceTracking.facePrediction;
                        setInterval(function(){
                            if (faceTracking.facePrediction.className == faceOld.className){
                                var prediction = faceTracking.facePrediction;
                            } else {
                                var prediction = faceOld;
                            }
                            faceOld = faceTracking.facePrediction;
                            socket.emit('faceRecognition', {
                                "prediction": prediction,
                                "rect": faceTracking.faceRect
                            });
                        }, Math.ceil(1000/10))
                        socket.on('disconnect', function(){
                        console.log('user disconnected');
                        });
                    });
                }
                var faceTracking = require("/home/alex/smart-home/lib/trackFace.js");
                
                
            } else {
                deviceState["video"] = "offline";
            }
            
        });    
    }

    setInterval(function(){
        isVideoOnline();
        isGarageOnline();
    }, 120000)
    
    var peopleState = {
        offline: [],
        online: []
    }

    function whoIsOnline() {
        // peopleState = {
        //     "online": [],
        //     "offline": {
        //         "DC:EF:CA:DF:A3:04": {
        //             name: "alex",
        //             prettyName: "Alex",
        //             "time": Date.now()
        //         },
        //         "A0:C9:A0:95:0D:76": {
        //             name: "lorraine",
        //             prettyName: "Lorraine",
        //             "time": Date.now()
        //         },
        //         "92:FD:61:CA:D2:9D": {
        //             name: "steve",
        //             prettyName: "Steve",
        //             "time": Date.now()
        //         },
        //         "50:82:D5:BD:7E:31": {
        //             name: "erika",
        //             prettyName: "Erika",
        //             "time": Date.now()
        //         }
        //     }
        // };
    
        // var quickscan = new nmap.QuickScan('192.168.2.1/24');
     
        // quickscan.on('complete', function(data){
        //     var offline = peopleState["offline"];
        //     peopleState["offline"] = [];
        //     var j = 0;
        //     for(var i = 0; i < data.length; i++){
        //         var mac = data[i]["mac"];
    
        //         //If a device we care about is online
        //         if(!empty(offline[mac])){
    
        //             peopleState["online"].push({
        //                 "prettyName": people[mac]["prettyName"],
        //                 "name": people[mac]["name"],
        //                 "time": Date.now()
        //             });
    
        //             delete offline[mac];
        //             j++;
        //         }
        //     }
    
        //     for (var device in offline) {
        //         console.log(device);
        //         peopleState["offline"].push({
        //             "prettyName": people[device]["prettyName"],
        //             "name": people[device]["name"],
        //             "time": Date.now()
        //         });
        //     };
        //     console.log(peopleState);
        // });
        peopleState = {
            offline: [],
            online: []
        }
        for (var i = 0; i < Object.keys(users).length; i++){
            var user = users[Object.keys(users)[i]];
            if (user.state == "online"){
                peopleState["online"].push({
                    "name": user.first_name,
                    "time": user.lastStateChange
                });
            } else {
                peopleState["offline"].push({
                    "name": user.first_name,
                    "time": user.lastStateChange
                })
            }
        }
        console.log(peopleState);
        return peopleState;
    }
    
    app.post('/launcher', isLoggedIn, function(req, res) {
        //console.log(req.body);
    
        if(req.body.buzz == "toggle"){
                var clientServerOptions = {
                    uri: 'http://192.168.2.230:2334',
                    body: JSON.stringify({"buzz": "toggle"}),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                request(clientServerOptions, function (error, response) {
                    if(!empty(error)){
                        res.json({error: "error"});
                        return;
                    }
                    
                    if(!empty(response)){
                        console.log(error,response.body);
                        res.json(response.body);
                    }
                    return;
                });   
        } else {
        }
    
        if(req.body.ac == "toggle"){
            var clientServerOptions = {
                uri: 'http://192.168.2.230:2334',
                body: JSON.stringify({"ac": "toggle"}),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            request(clientServerOptions, function (error, response) {
                
                if(!empty(error)){
                    res.json({error: "error"});
                    return;
                }
                
                if(!empty(response)){
                    console.log(error,response.body);
                    res.json(response.body);
                }
                return;
            });   
    } else {
    }
    
    if(req.body.garage == "toggle" && deviceState["garage"] == "online"){
        var clientServerOptions = {
            uri: 'http://192.168.2.232:2334',
            body: JSON.stringify({"garage": "toggle"}),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        request(clientServerOptions, function (error, response) {
            
            if(!empty(error)){
                res.json({error: "error"});
                return;
            }
            
            if(!empty(response)){
                console.log(error,response.body);
                res.json(response.body);
            }
            return;
        });   
    } else {
    }
    
        if(req.body.whoisonline == "toggle"){
            res.json(peopleState);  
        } 
    });
    
    app.get('/', function(req, res) {
        
        clientServerOptions2 = {
            uri: 'http://192.168.2.230:2334/temp',
            body: JSON.stringify({"temp": "temp"}),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        request(clientServerOptions2, function (error, response) {
            if(!empty(response)){
                tempInfo = JSON.parse(response.body);
                if(tempInfo.error){
                    tempInfo = tempInfo.error;
                } else {
                    tempInfo = {temp: tempInfo.temp, humidity: tempInfo.humidity};
                }
            }
        });
        res.render(__dirname + '/pages/index', {
            data: 12, 
            localTemp: tempInfo,
        });
        
    });
    
    var weather;
    
    function getWeather(){
        request({
            uri: info.weather.uri,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, function (error, response) {
            if (error){
                console.log("Error: Cannot fetch weather -- " + error)
                return;
            }
            weather = response.body;
        });
    }
    
    var garage;
    
    function getGarageInfo(){
        //select count (*),DATE(datum) date from tx_feeder where datum between (CURDATE() - INTERVAL 31 DAY) and (CURDATE() - INTERVAL 1 DAY) group by DATE(datum);
        con.query(`SELECT SUM(case when state = 'remote' then 1 else 0 end) AS remote,
         SUM(case when state = 'web' then 1 else 0 end) AS web,
          SUM(case when state = 'button' then 1 else 0 end) AS button,
           DATE_FORMAT(datetime, '%m/%d/%Y') AS datetime
            FROM smart_home.garage WHERE datetime BETWEEN NOW() - INTERVAL 7 DAY AND NOW() group by DATE_FORMAT(datetime, '%m/%d/%Y');
            SELECT state, datetime FROM smart_home.garage ORDER BY datetime DESC LIMIT 1`, [0, 1], function (err, result, fields) {
            if (err) throw err;
            garage = result;
        });
    }
    
    getWeather();
    getGarageInfo()
    setInterval(function(){
        getWeather();
        getGarageInfo();
        whoIsOnline();
    },120000)
    
    
    app.get('/weather', function(req, res) {
        res.json(weather);
    });
    
    app.get('/garage', function(req, res) {
        res.json(JSON.stringify(garage));
    });

    app.get('/state', function(req, res) {
        res.json(deviceState);
    });


    //API Post
    app.post("/api/:api_key/:method", function (req, res) {
        con.query(`SELECT * FROM smart_home.users WHERE api_key = '${req.params.api_key}'`, function (err, result, fields) {
            if(!empty(result) && result[0].isVerified == true){

                var method = req.params.method;
                console.log(method);

                switch(method){
                    case "garage": {
                        switch(req.body.action){
                            case "open": {

                                //Open Garage Door
                                request({
                                    uri: 'http://192.168.2.232:2334',
                                    body: JSON.stringify({"garage": "toggle"}),
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                }
                                , function (error, response) {
                                    
                                    if(!empty(error)){
                                        res.json({error: "error"});
                                        return;
                                    }
                                    
                                    if(!empty(response)){
                                        console.log(error,response.body);
                                        res.json(response.body);
                                    }
                                    return;
                                }); 
                                //res.send({status: 200, message: "success"});
                                break;
                            }
                            default: {
                                res.status(400).send({status: 400, message: "unknown action"});
                                break;
                            }
                        }

                        break;
                    }

                    case "lights":{
                        var room = req.body.room;
                        var bright = parseInt(req.body.brightness);
                        var type = req.body.type;
                        

                        console.log(type);

                        if (type == "tasmota"){

                            if (empty(info.rooms.tasmota[room])){
                                return;
                            }

                            if (bright < 20){
                                client.publish(`cmnd/${room}/POWER`, "OFF");
                            } else {
                                client.publish(`cmnd/${room}/Dimmer`, bright.toString());
                            }

                            res.send({"status": 200, "tasmota": info.rooms.tasmota[room]});

                                
                        } else if(type == "hue"){
                            
                            if (empty(info.rooms.hue[room])){
                                return;
                            }

                            if(bright > 20){
                                var hue_data = {"on": true, "bri": bright};
                            } else {
                                var hue_data = {"on": false};
                            }

                            request({
                                uri: "http://192.168.2.17/api/" + info.hue.username + "/lights/" + info.rooms.hue[room].id + "/state",
                                method: 'PUT',
                                body: JSON.stringify(hue_data),
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            },
                            function(error, response, body) {
                                if(!error) {
                                    var response = JSON.parse(body);
                                    console.log(response.length);
                                    for (var i = 0; i < response.length; i++){
                                        
                                        console.log(response[i].success)
                                        if (response[i].success["/lights/1/state/bri"] != undefined){
                                            info.rooms.hue[room].bri = response[i].success["/lights/1/state/bri"];
                                        }

                                        if (response[i].success["/lights/1/state/on"] != undefined){
                                            info.rooms.hue[room].state = (response[i].success["/lights/1/state/on"] == "true" ? "ON" : "OFF");
                                        }
                                         
                                    }
                                }
    
                                res.send({"status": 200, "tasmota": info.rooms.tasmota, "hue": info.rooms.hue});
                            });

                            //res.send({"status": 200, "data": response.body});
                        } else {
                            res.send({"status": 400, "message": "Unknown type."});
                        }
                        
                        
                        return;
                    }

                    case "debug": {
                        console.log(req.body.action);
                        res.send({status: 22, message: "DEBUGGED"});
                        break;
                    }

                    case "location": {
                        var currentPos = {
                            lat: req.body.lat,
                            lng: req.body.lng
                        };

                        if(currentPos.lng == undefined || currentPos.lat == undefined){
                            res.status(400).send({status: 400, message: "missing params"});
                            console.log("missing paramsssss", req.body)
                            break;
                        }

                        
                        

                        var isInRange = functions.arePointsNear(currentPos, info.homeAddress, 0.5);
                        console.log(result[0].first_name + " " + result[0].last_name + " is in range: " + isInRange);
                        
                        if (isInRange){

                            //if user is home
                            if (users[result[0].email].state == "offline"){
                                console.log("date changed")
                                users[result[0].email].lastStateChange = Date.now()
                            }
                            users[result[0].email].state = "online";
                            
                        } else {

                            //if user is not home
                            if (users[result[0].email].state == "online"){
                                console.log("date changed")
                                users[result[0].email].lastStateChange = Date.now()
                            }
                            users[result[0].email].state = "offline";
                        }
                            whoIsOnline()
                         //console.log(users);
                        res.send({status: 200, message: "position updated"})
                        break;
                    }
                    default: {
                        res.status(400).send({status: 400, message: "unknown method"});
                        break;
                    }
                }

                // if(method == "garage"){
                //     console.log(req.body);
                //     switch(req.body.action){
                //         case "open": {
                //             res.send({status: 200, message: "success"});
                //             break;
                //         }
                //         default: {
                //             res.status(400).send({status: 400, message: "unknown action"});
                //             break;
                //         }
                //     }
                // } else if(method == "front_door"){
                //     switch(req.body.action){
                //         case "open": {
                //             res.send({status: 200, message: "success"});
                //         }
                //     }
                // } else {
                //     res.status(400).send("unknown method");
                // }
                //res.send(req.params);
            } else {
                res.status(401).send("invalid api_key/not verified");
            }
        });
    });

    //API Get
    app.get("/api/:api_key/:method", function (req, res) {
        con.query(`SELECT * FROM smart_home.users WHERE api_key = '${req.params.api_key}'`, function (err, result, fields) {

            if(empty(result) && result[0].isVerified == false){
                res.status(401).send("invalid api_key/not verified");
                return;
            }

                var method = req.params.method;
            switch(method){
                case "api_key": {
                    console.log(req.user);
                    switch(req.query.refresh){
                        case "true": {

                            var newKey = functions.generateApiKey();
                            con.query(`UPDATE smart_home.users SET api_key = '${newKey}' WHERE api_key = '${req.params.api_key}'`, function (err, result, fields) {
                                if (err) throw err;
                                //If successfully changed the api key
                                //Change users api key in the users object
                                users[result[0]["email"]].api_key = newKey;

                                res.send({status: 200, message: "success", new_key: newKey});
                            
                            });
                            break;
                        }
                        default: {
                            res.status(400).send({status: 400, message: "unknown action"});
                            break;
                        }
                    }    
                }

                case "lights": {

                    //Im really not sure how this works..


                    var tasmota_lights = {};
                    var hue_lights = {};

                    

                    request({
                        uri: "http://192.168.2.17/api/" + info.hue.username + "/lights",
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    },
                    function(error, response, body) {
                        if(!error) {

                            for (var i = 0; i < Object.keys(info.rooms.hue).length; i++){
                                var room = Object.keys(info.rooms.hue)[i];
                                var id = info.rooms.hue[room].id;
                                console.log(room)
                                info.rooms.hue[room].bri = JSON.parse(body)[id].state.bri;
                                info.rooms.hue[room].state = (JSON.parse(body)[id].state.on == true) ? "ON" : "OFF";
                                console.log(info.rooms.hue);
                            }
                        }

                        res.send({"status": 200, "tasmota": info.rooms.tasmota, "hue": info.rooms.hue});
                    });

                    

                    break;
                }

                default: {
                    res.status(400).send("unknown method");
                    break;
                }
            }
                //res.send(req.params);
        });
    });

    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {
        //console.log(req.session.passport.user.email)
        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated()){

            con.query(`SELECT isVerified FROM smart_home.users WHERE email = '${req.session.passport.user.email}'`, function (err, result, fields) {
                if (err) throw err;

                //console.log(result[0]["isVerified"])

                if (result[0]["isVerified"] == 1){
                    return next();
                } else {
                    res.redirect('/accountstatus');
                }
            });
        } else {
            // if they aren't redirect them to the home page
            res.redirect('/login');
        }

        
        
    }  
};
