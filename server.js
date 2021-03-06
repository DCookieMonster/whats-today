'use strict';
const express = require('express');
const app = express();
const http = require('http');
const request = require("request");
const debug = require('debug')('development');
const name = 'whats-today';
debug('booting %s', name);
/* GET users listing. */
const bodyParser = require('body-parser');
Date.prototype.yyyymmdd = function() {
    const mm = this.getMonth() + 1; // getMonth() is zero-based
    const dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('');
};

const gcm = require('node-gcm');
const admin = require("firebase-admin");

app.listen(process.env.PORT || 3000, function() {
    console.log('Local Server : http://localhost:3000');
});

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const serviceAccount = require("./keys/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://whats-today-pwa.firebaseio.com"
});
const GCM_API_KEY = 'AAAARLoMuOE:APA91bGDcR4xkpwDFI7_qdb7KgUHu3R3Q27R0g5gnQRLS4htBQS_rtl9MKB1KPbowTJ6-u6m7RM0ASlCeSNmVNk4679Ibh8OEAB54lzHmFVY7b4pCjVwpjbuTu9wwhNI5l0GAdDnFcss';

const db = admin.firestore();
const cloth_ref = db.collection("clothing");
const users_db = db.collection("users");

//To server static assests in root dir
app.use(express.static(__dirname));

//To allow cross origin request
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//To server index.html page
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// ROUTES FOR OUR SIGN IN API
// =============================================================================
const signInRouter = express.Router(); // get an instance of the express Router

app.use('/sign_in', signInRouter);

signInRouter.post('/', function(req, res) {
    if (!req.body) {
        res.status(400);
    }
    const email = req.body.email;
    users_db.where('email', '==', email).get()
        .then(docs => {
        // Document read successfully.
        let data = [];
        docs.forEach(doc => data.push({ data: doc.data(), uid: doc.id }));
        if (data.length > 0) {
            res.status(200).send(data[0])
        } else {
            let newUser = users_db.doc();
            newUser.set(req.body).then(() => { // fetch the doc again and show its data
                newUser.get().then(doc => {
                    res.status(200).send({ data: doc.data(), uid: doc.id })
                })
            });
        }
    })
        .catch(err => {
            console.log('Error getting documents', err);
            res.status(400).send({})
        });

});

signInRouter.post('/id', function(req, res) {
    if (!req.body) {
        res.status(400);
    }
    const data = { user: {} };
    const id = req.body.uid;
    users_db.doc(id).get().then(doc => {
        if (doc.exists) {
            data['user'] = { data: doc.data(), uid: doc.id };
            let date = new Date();
            let cKey = doc.id + '_' + date.yyyymmdd();
            cloth_ref.doc(cKey).get().then(clothingDoc => {
                if (clothingDoc.exists) {
                    data['clothing'] = clothingDoc.data();
                }
                console.log(data);
                res.status(200).send(data)
            });
        } else {
            res.status(401)
        }
    });

});

// ROUTES FOR OUR WARM LEVEL API
// =============================================================================
const router = express.Router(); // get an instance of the express Router

app.use('/warm_level', router);

router.post('/', function(req, res) {
    if (!req.body) {
        res.status(400);
    }
    const date = new Date(req.body.time);
    const key = req.body.uid + '_' + date.yyyymmdd();
    cloth_ref.doc(key).get().then(clothingDoc => {
        if (clothingDoc.exists) {
            // update warm level
            let data = { warm_level: req.body.warm_level };
            cloth_ref.doc(key).update(data)
        } else {
            // set warm level
            let data = {
                id: key,
                warm_level: req.body.warm_level,
                user_id: req.body.uid,
                temp: req.body.temp,
                city: req.body.city,
                created_at: date.getTime()
            };
            cloth_ref.doc(key).set(data);
        }
    });
});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.post('/feeling', function(req, res) {
    if (!req.body) {
        res.status(400);
    }
    const date = new Date(req.body.time);
    const key = req.body.uid + '_' + date.yyyymmdd();
    cloth_ref.doc(key).get().then(clothingDoc => {
        if (clothingDoc.exists) {
            // update feeling on what the user wear today
            let data = {
                feeling: req.body.feeling,
                feedbackTime: req.body.time
            };
            cloth_ref.doc(key).update(data)
        } else {
            res.status(400).send({ error: 'wrong keys' })
        }
    });

});

router.get('/recommended', function(req, res) {
    if (!req.body) {
        res.status(400);
    }
    const user_id = req.query.uid;
    cloth_ref.where('user_id', '==', user_id).get()
        .then(clothingDocs => {
            let data = [];
            clothingDocs.forEach(doc => {
                data.push({ data: doc.data(), uid: doc.id });
                console.log(doc.id, '=>', doc.data());
            });
            if (data.length > 0) {
                for (let key in data) {
                    let clothing = data[key].data;
                    if (!clothing.feeling || clothing.feeling === null) {
                        continue;
                    }
                    let date = new Date();
                    let created_at = new Date(clothing.created_at);
                    if (created_at.yyyymmdd() === date.yyyymmdd()) {
                        continue;
                    }
                    let temp = parseInt(req.query.temp);
                    if (clothing.temp < temp + 4 && clothing.temp > temp - 4) {
                        res.status(200).send({ recommended: clothing });
                        break;
                    }
                }
            }
            res.status(200).send({ recommended: {} })
        })
        .catch(err => {
            console.log('Error getting documents', err);
            res.status(200).send({ recommended: {} })
        });

});

const userRouter = express.Router(); // get an instance of the express Router

app.use('/users', userRouter);

userRouter.get('/:user_id/history', function(req, res) {
    if (!req.params) {
        res.status(400);
    }
    const user_id = req.params.user_id;
    cloth_ref.where('user_id', '==', user_id).get()
        .then(clothingDocs => {
            let data = [];
            clothingDocs.forEach(doc => {
                data.push(doc.data());
            });
            res.status(200).send({ history: data })
        })
        .catch(err => {
            console.log('Error getting documents', err);
            res.status(400).send({error: 'Error getting documents'})
        });
});

//To receive push request from client
app.post('/notification/subscribe', function(req, res) {
    if (!req.body) {
        res.status(400);
    }
    const temp = req.body.subscription.endpoint.split('/');
    const id = req.body.uid;
    const regTokens = [temp[temp.length - 1]];

    users_db.doc(id).get().then(doc => {
        if (doc.exists) {
            const data = {
                push_token: req.body.subscription,
            };
            users_db.doc(id).update(data)
        }
    });
    res.status(200);

    // // Prepare a message to be sent
    // const message = new gcm.Message({
    //     collapseKey: 'demo',
    //     priority: 'high',
    //     contentAvailable: true,
    //     delayWhileIdle: true,
    //     timeToLive: 3,
    //     restrictedPackageName: "somePackageName",
    //     dryRun: true,
    //     data: {
    //         key1: 'message1',
    //         key2: 'message2'
    //     },
    //     notification: {
    //         title: "Hello, World",
    //         icon: "ic_launcher",
    //         body: "This is a notification that will be displayed if your app is in the background."
    //     }
    // });



    // const sender = new gcm.Sender(GCM_API_KEY); //Replace with your GCM API key

    // Now the sender can be used to send messages
    // sender.send(message, { registrationTokens: regTokens }, function(error, response) {
    //     if (error) {
    //         console.error(error);
    //         res.status(400);
    //     } else {
    //         users_db.doc(id).get().then(doc => {
    //             if (doc.exists) {
    //                 const data = {
    //                     push_token: req.body.subscription,
    //                 };
    //                 users_db.doc(id).update(data)
    //             }
    //         });
    //         res.status(200);
    //
    //     }
    // });
});