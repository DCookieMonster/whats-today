'use strict';
var express = require('express');
var app = express();
var http = require('http');
var request = require("request");
/* GET users listing. */
var bodyParser = require('body-parser');

var gcm = require('node-gcm');
var admin = require("firebase-admin");

app.listen(process.env.PORT || 3000, function() {
    console.log('Local Server : http://localhost:3000');
});

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

var serviceAccount = require("./keys/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://whats-today-pwa.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("accounts");
ref.once("value", function(snapshot) {
    // console.log(snapshot.val());
});

var cloth_ref = db.ref("clothing");
cloth_ref.once("value", function(snapshot) {
    // console.log(snapshot.val());
});

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

app.post('/chose_clothing', function (req, res) {
    if (!req.body) {
        res.status(400);
    }
    var date = new Date();
    var key = req.body.uid + '_' + req.body.city.replace(' ', '_') + '_' +date.yyyymmdd();

    cloth_ref.orderByChild("ID").equalTo(key).once("value", function(snapshot) {
        var userData = snapshot.val();
        if (userData){
            console.log("exists!");
            var data = { updated_at: new Date().getTime() };
            data[req.body.chosen_cloth] = true;
            cloth_ref.child(key).update(data)
        }
        else{

                var data = {
                    ID: key,
                    coat: false,
                    umbrella: false,
                    shorts: false,
                    t_shirt: false,
                    shirt: false,
                    boots: false,
                    skirt: false,
                    trousers: false,
                    scarf: false,
                    flip_flop: false,
                    mittens: false,
                    shoes: false,
                    user_id: req.body.uid,
                    temp: req.body.temp,
                    city: req.body.city,
                    created_at: date
                };
                data[req.body.chosen_cloth] = true;
            cloth_ref.child(key).set(data)


        }
    });

});

app.post('/unchose_clothing', function (req, res) {
    if (!req.body) {
        res.status(400);
    }

    var date = new Date();
    var key = req.body.uid + '_' + req.body.city.replace(' ', '_') + '_' +date.yyyymmdd();
    cloth_ref.orderByChild("ID").equalTo(key).once("value", function(snapshot) {
        var userData = snapshot.val();
        if (userData) {
            console.log("exists!");
            var data = {};
            data[req.body.chosen_cloth] = false;
            cloth_ref.child(req.body.uid).update(data)
        }
    })


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
            var cKey = user + '_' + req.body.city.replace(' ', '_') + '_' +date.yyyymmdd();
            cloth_ref
                .orderByChild("ID")
                .equalTo(cKey)
                .once("value", function(snapshot) {
                    var clothing = snapshot.val();
                    var date = new Date();
                    var cKey = user + '_' + req.body.city.replace(' ', '_') + '_' +date.yyyymmdd();
                    data = {uid: user, clothing: clothing[cKey]};
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

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd
    ].join('');
};

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

