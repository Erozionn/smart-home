// app/routes.js



module.exports = function(app, passport, express, isReachable, url, request, bodyParser, empty, nmap, io, con, functions, info, passportSocketIo, cookieParser, session) {
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

    app.use('/main', express.static(__dirname + '/pages/main'));

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', isLoggedIn, function(req, res) {
        res.render('index.ejs', {
            data: 12, 
            localTemp: tempInfo,
            api_key: req.user.api_key
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
    var peopleState = {
        "online": {},
        "offline": {}
    };
    
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
    function isVideoOnline(boot = false){
        isReachable('192.168.2.231:8080').then(function(reachable){
    
    
            console.log(reachable == true ? "[\x1b[32mONLINE\x1b[0m] Video feed" : "[\x1b[31mOFFLINE\x1b[0m] Video feed")
            
            if (reachable == false){
                setTimeout(function(){
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
                var faceTracking = require("/var/www/html/homeauto/lib/trackFace.js");
                
                
            } else {
                deviceState["video"] = "offline";
            }
            
        });    
    }

    setInterval(function(){
        isVideoOnline();
        isGarageOnline();
    }, 120000)
    
    
    setInterval(function(){
        whoIsOnline();
    }, 900000);
    whoIsOnline();
    
    function whoIsOnline() {
        peopleState = {
            "online": [],
            "offline": {
                "DC:EF:CA:DF:A3:04": {
                    name: "alex",
                    prettyName: "Alex",
                    "time": Date.now()
                },
                "A0:C9:A0:95:0D:76": {
                    name: "lorraine",
                    prettyName: "Lorraine",
                    "time": Date.now()
                },
                "92:FD:61:CA:D2:9D": {
                    name: "steve",
                    prettyName: "Steve",
                    "time": Date.now()
                },
                "50:82:D5:BD:7E:31": {
                    name: "erika",
                    prettyName: "Erika",
                    "time": Date.now()
                }
            }
        };
    
        var quickscan = new nmap.QuickScan('192.168.2.1/24');
     
        quickscan.on('complete', function(data){
            var offline = peopleState["offline"];
            peopleState["offline"] = [];
            var j = 0;
            for(var i = 0; i < data.length; i++){
                var mac = data[i]["mac"];
    
                //If a device we care about is online
                if(!empty(offline[mac])){
    
                    peopleState["online"].push({
                        "prettyName": people[mac]["prettyName"],
                        "name": people[mac]["name"],
                        "time": Date.now()
                    });
    
                    delete offline[mac];
                    j++;
                }
            }
    
            for (var device in offline) {
                console.log(device);
                peopleState["offline"].push({
                    "prettyName": people[device]["prettyName"],
                    "name": people[device]["name"],
                    "time": Date.now()
                });
            };
            console.log(peopleState);
        });
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
        getGarageInfo()
    },300000)
    
    
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

                if(method == "garage"){
                    console.log(req.body);
                    switch(req.body.action){
                        case "open": {
                            res.send({status: 200, message: "success"});
                            break;
                        }
                        default: {
                            res.status(400).send({status: 400, message: "unknown action"});
                            break;
                        }
                    }
                } else if(method == "front_door"){
                    switch(req.body.action){
                        case "open": {
                            res.send({status: 200, message: "success"});
                        }
                    }
                } else {
                    res.status(400).send("unknown method");
                }
                //res.send(req.params);
            } else {
                res.status(401).send("invalid api_key/not verified");
            }
        });
    });

    //API Get
    app.get("/api/:api_key/:method", function (req, res) {
        con.query(`SELECT * FROM smart_home.users WHERE api_key = '${req.params.api_key}'`, function (err, result, fields) {
            if(!empty(result) && result[0].isVerified == true){

                var method = req.params.method;

                if(method == "api_key"){
                    console.log(req.user);
                    switch(req.query.refresh){
                        case "true": {

                            var newKey = functions.generateApiKey();
                            con.query(`UPDATE smart_home.users SET api_key = '${newKey}' WHERE api_key = '${req.params.api_key}'`, function (err, result, fields) {
                                if (err) throw err;
                                res.send({status: 200, message: "success", new_key: newKey});
                            
                            });
                            break;
                        }
                        default: {
                            res.status(400).send({status: 400, message: "unknown action"});
                            break;
                        }
                    }
                } else {
                    res.status(400).send("unknown method");
                }
                //res.send(req.params);
            } else {
                res.status(401).send("invalid api_key/not verified");
            }
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


