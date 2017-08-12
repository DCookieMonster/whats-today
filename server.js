'use strict';
var express = require('express');
var app = express();
var http = require('http');
var request = require("request");
/* GET users listing. */
var bodyParser = require('body-parser');
Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd
    ].join('');
};

var gcm = require('node-gcm');
var admin = require("firebase-admin");

app.listen(process.env.PORT || 3000, function() {
    console.log('Local Server : http://localhost:3000');
});

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var serviceAccount = require("./keys/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://whats-today-pwa.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var cloth_ref = db.ref("clothing");
var ref = db.ref("accounts");


//To server static assests in root dir
app.use(express.static(__dirname));

//To allow cross origin request
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//To server index.html page
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/sign_in', function (req, res) {
    if (!req.body) {
        res.status(400);
    }
    var data = {};
    var email = req.body.email;
    var usersRef = ref.child("users");
    usersRef.orderByChild("email").equalTo(email).once("value", function(snapshot) {
        var userData = snapshot.val();
        if (userData){
            for (var key in userData){
                var user = key;
            }
            var date = new Date();
            var cKey = user + '_' + date.yyyymmdd();
            cloth_ref.child(cKey)
                .once("value", function(snapshot) {
                    var clothing = snapshot.val();
                    data = {uid: user};
                    if (clothing){
                        data['clothing'] = clothing;
                    }
                    res.json(data);
                    res.status(200)
                });

        }
        else{
            var newUser = usersRef.push(
                req.body
            );
            data = {uid: newUser.key};
            res.json(data);
            res.status(200)
        }
    });


});


app.post('/warm_level', function (req, res) {
    if (!req.body) {
        res.status(400);
    }
    var date = new Date(req.body.time);
    var key = req.body.uid  + '_' + date.yyyymmdd();

    cloth_ref.orderByChild("ID").equalTo(key).once("value", function(snapshot) {
        var clothingInfo = snapshot.val();
        if (clothingInfo) {
            var data = { warm_level: req.body.warm_level };
            cloth_ref.child(key).update(data)
        }
        else{
            var data = {
                ID: key,
                warm_level: req.body.warm_level,
                user_id: req.body.uid,
                temp: req.body.temp,
                city: req.body.city,
                created_at: date.getTime()
            };
            cloth_ref.child(key).set(data)
        }

    })
});

app.post('/sign_in/id', function (req, res) {
    if (!req.body) {
        res.status(400);
    }
    var data = {};
    var id = req.body.uid;
    var usersRef = ref.child("users");
    usersRef.child(id)
        .once('value', function(snapshot) {
            var user_id = snapshot.key;
            var date = new Date();
            var cKey = id  + '_' + date.yyyymmdd();
            cloth_ref.child(cKey)
                .once('value', function (snapshot) {
                    var clothing = snapshot.val();
                    data = {uid: user_id};
                    if (clothing){
                        data['clothing'] = clothing;
                    }
                    res.json(data);
                    res.status(200)
                })
                .catch(function () {
                    data = {uid: user_id};
                    res.json(data);
                    res.status(200)
                });
        })
        .catch(function () {
            res.status(401);

        });
});


// ROUTES FOR OUR WARM LEVEL API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

app.use('/warm_level',router);

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.post('/feeling', function(req, res) {
    if (!req.body) {
        res.status(400);
    }
    var date = new Date(req.body.time);
    var key = req.body.uid  + '_' + date.yyyymmdd();

    cloth_ref.orderByChild("ID").equalTo(key).once("value", function(snapshot) {
        var clothingInfo = snapshot.val();
        if (clothingInfo) {
            var data = {
                feeling: req.body.feeling,
                feedbackTime: req.body.time
            };
            cloth_ref.child(key).update(data)
        }
        else{
            res.json({error: 'wrong keys'});
            res.status(400)
        }

    })});

router.get('/recommended', function (req, res) {
    if (!req.body) {
        res.status(400);
    }
    var key = req.query.uid  + '_';
    cloth_ref.orderByChild("user_id").equalTo(req.query.uid).on("value", function(snapshot) {
        var clothingInfo = snapshot.val();
        if (clothingInfo) {
            for (var key in clothingInfo){
                var clothing = clothingInfo[key];
                if (!clothing.feeling || clothing.feeling == null){
                    continue;
                }
                var date = new Date();
                var created_at = new Date(clothing.created_at);
                if (created_at.yyyymmdd() == date.yyyymmdd()){
                    continue;
                }
                var temp = parseInt(req.query.temp);
                if (clothing.temp < temp + 2 && clothing.temp > temp - 2){
                    res.json({recommended: clothing});
                    res.status(200);
                    return;
                    break;
                }
            }
            res.json({recommended: {} });
            res.status(200)
            return;
        }
        else {
            res.json({recommended: {} });
            res.status(200)
        }
    });

});



//To receive push request from client
app.post('/send_notification', function (req, res) {
  if (!req.body) {
    res.status(400);
  }

   // Prepare a message to be sent
  var message = new gcm.Message();


  var temp = req.body.endpoint.split('/');
  var regTokens = [temp[temp.length - 1]];

  var sender = new gcm.Sender('AAAARLoMuOE:APA91bGDcR4xkpwDFI7_qdb7KgUHu3R3Q27R0g5gnQRLS4htBQS_rtl9MKB1KPbowTJ6-u6m7RM0ASlCeSNmVNk4679Ibh8OEAB54lzHmFVY7b4pCjVwpjbuTu9wwhNI5l0GAdDnFcss'); //Replace with your GCM API key
    var usersRef = ref.child("users_tokens");

  // Now the sender can be used to send messages
  sender.send(message, { registrationTokens: regTokens }, function (error, response) {
  	if (error) {
      console.error(error);
      res.status(400);
    }
  	else {
      console.log('sent');
      console.log(response);
        usersRef.set(
            {
                token: regTokens,
                created_at: new Date()
            }
        );
      res.status(200);

    }
  });
});

