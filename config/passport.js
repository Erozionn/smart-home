// config/passport.js
				
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
// var mysql = require('mysql');

var bcrypt = require("bcrypt-nodejs");

// var connection = mysql.createConnection({
//     host: "localhost",
//     user: "smart_home",
//     password: "ekjqebRx321",
//     timezone: "America/Toronto",
//     });

//connection.query('USE vidyawxx_build2');	

// expose this function to our app using module.exports
module.exports = function(passport, functions, connection, users) {
    console.log(functions);

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    // passport.serializeUser(function(user, done) {
	// 	done(null, user.id);
    // });

    // // used to deserialize the user
    // passport.deserializeUser(function(id, done) {
	// 	connection.query("select * from smart_home.users where uid = "+id,function(err,rows){
            
    //         //if (rows){
    //             done(err, rows[0]);
    //         //}
			
	// 	});
    // });
	passport.serializeUser(function(user, done) {
        done(null, user);
      });
      
      passport.deserializeUser(function(user, done) {
        done(null, user);
      });


    // =========================================================================
    // GOOGLE SIGNUP ===========================================================
    // =========================================================================

      passport.use(new GoogleStrategy({
        clientID: "732746538204-tmg764h3r0bscmj1001hqodgdj3srv63.apps.googleusercontent.com",
        clientSecret: "gnVHM-R6Vdijh8nSqlG-HGyd",
        callbackURL: "http://home.alextasciyan.com/auth/google/callback"
      },
      function(accessToken, refreshToken, profile, cb) {
          console.log(profile)
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //   return cb(err, user);
        // });
      }
    ));


 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        connection.query("select * from smart_home.users where email = '"+email+"'",function(err,rows){
			console.log(rows);
			console.log("above row object");
			if (err)
                return done(err);
			 if (rows.length) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

				// if there is no user with that email
                // create the user

                bcrypt.hash(password, null, null, function(err, hash) {
                    // Store hash in your password DB.
                    var newUser = new Object();
                    
                    newUser.email    = email;
                    newUser.password = hash; // use the generateHash function in our user model
                    newUser.api_key  = functions.generateApiKey();
                
                    var insertQuery = "INSERT INTO smart_home.users ( email, password, isVerified, api_key, first_name, last_name, address ) values ('" + email +"','"+ hash +"', 0, '" + newUser.api_key + "', NULL, NULL, NULL)";
                    
                    connection.query(insertQuery,function(err,rows){
                        
                        if(err) throw err;
                        console.log(rows)
                        newUser.id = rows.insertId;
                        users[newUser.email] = {
                            email: newUser.email,
                            state: "offline",
                            lastStateChange: Date.now(),
                            //first_name: result[i]["first_name"],
                            //last_name: result[i]["last_name"],
                            //address: result[i]["address"],
                            api_key: newUser.api_key,
                        };
                        return done(null, newUser);
                    });	
                });
            }	
		});
    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

         connection.query("SELECT * FROM smart_home.users WHERE `email` = '" + email + "'",function(err,rows){
			if (err)
                return done(err);
			 if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            } 
			
            // if the user is found but the password is wrong
            bcrypt.compare(password, rows[0].password, function(err, res) {
                // res == true

                if(res == true){
                    // all is well, return successful user
                    return done(null, rows[0]);	
                } else {
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                }
            });
		});
		


    }));

};