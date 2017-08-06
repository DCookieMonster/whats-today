'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var gcm = require('node-gcm');
var app = express();

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//To server static assests in root dir
app.use(express.static(__dirname));

//To allow cross origin request
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

//To server index.html page
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
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

  // Now the sender can be used to send messages
  sender.send(message, { registrationTokens: regTokens }, function (error, response) {
  	if (error) {
      console.error(error);
      res.status(400);
    }
  	else {
      console.log('sent');
      console.log(response);
      res.status(200);
    }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Local Server : http://localhost:3000');
});
