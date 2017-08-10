// Initialize Firebase
var config = {
    apiKey: "AIzaSyCmvpuvKQdVzaZYpIRz6paxjUkFZpclp3k",
    authDomain: "whats-today-pwa.firebaseapp.com",
    databaseURL: "https://whats-today-pwa.firebaseio.com",
    projectId: "whats-today-pwa",
    storageBucket: "whats-today-pwa.appspot.com",
    messagingSenderId: "295179172065"
};
firebase.initializeApp(config);
// FirebaseUI config.
// var uiConfig = {
//     signInSuccessUrl: '/',
//     signInOptions: [
//         // Leave the lines as is for the providers you want to offer your users.
//         firebase.auth.GoogleAuthProvider.PROVIDER_ID
//     ],
//     // Terms of service url.
//     tosUrl: '/'
// };
// var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
// ui.start('#firebaseui-auth-container', uiConfig);
var provider = new firebase.auth.GoogleAuthProvider();

var googleSigninElement = document.querySelector('.google_signing');
//Click event for subscribe push
googleSigninElement.addEventListener('click', function () {
    firebase.auth().signInWithRedirect(provider);


    // var isSubscribed = (googleSigninElement.dataset.checked === 'true');
    // if (localStorage.uid && localStorage.uid != null){
    //     return
    // }
    // if (isSubscribed) {
    //     // Initialize the FirebaseUI Widget using Firebase.
    //
    //     toggleAddDialog2(true)
    // }
    // else {
    //     toggleAddDialog2(true)
    //
    // }
});
var addDialog = document.querySelector('.dialog-container-2');
// Toggles the visibility of the add new city dialog.
var toggleAddDialog2 = function (visible) {
    if (visible) {
        addDialog.classList.add('dialog-container-2--visible');
    } else {
        addDialog.classList.remove('dialog-container-2--visible');
    }
};
//
// initApp = function() {
//     firebase.auth().onAuthStateChanged(function(user) {
//         if (user) {
//             if (localStorage.uid != null){
//                 return;
//             }
//             // User is signed in.
//             var displayName = user.displayName;
//             var email = user.email;
//             var photoURL = user.photoURL;
//             var uid = user.uid;
//             // var url_pref = 'https://whats-today.herokuapp.com';
//             var data = {
//                 googleId: uid,
//                 email: email,
//                 displayName: displayName,
//                 photoURL: photoURL,
//                 created_at: new Date().getTime()
//             };
//             //Form data with info to send to server
//             $.ajax({
//                 url: app.baseServerUrl + '/sign_in',
//                 method: 'POST',
//                 data: JSON.stringify(data),
//                 headers: {
//                     'Accept': 'application/json',
//                     'Content-Type': 'application/json'
//                 },
//                 success: function(response) {
//                     console.log('HHEWHEHWHEHWHHEWHE')
//                     console.log(response);
//                     localStorage.uid = response.uid;
//                     localStorage.user = JSON.stringify(data);
//                     localStorage.signIn = false;
//                     var googleButton = document.querySelector('.google_signing');
//                     $(googleButton).empty();
//                     googleButton.innerHTML = "<img src='"+photoURL+"' width='100%'>"
//                 }
//             });
//         }
//     }, function(error) {
//         console.log(error);
//     });
// };
//
window.addEventListener('load', function() {
   app.silentSignIn();
});

firebase.auth().getRedirectResult().then(function (result) {
    if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // ...
    }
    // The signed-in user info.
    var user = result.user;
    var data = {
        googleId: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        created_at: new Date().getTime(),
        city: app.city
    };
    //Form data with info to send to server
    $.ajax({
        url: app.baseServerUrl + '/sign_in',
        method: 'POST',
        data: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        success: function (response) {
            localStorage.uid = response.uid;
            localStorage.user = JSON.stringify(data);
            app.loginSuccess(user);
        }
    });

}).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
});

app.loginSuccess = function(user) {
    var googleButton = document.querySelector('.google_signing');
    $(googleButton).empty();
    googleButton.innerHTML = "<img src='" + user.photoURL + "' width='100%'>";
    var card_title = document.querySelector('.wearing-header');
    card_title.textContent = user.displayName + ', ' + card_title.textContent;
};

app.silentSignIn = function () {
    if (app.city != '' && localStorage.uid && localStorage.uid != null){
        var user = JSON.parse(localStorage.user);
        var data = {
            uid: localStorage.uid,
            created_at: new Date().getTime(),
            city: app.city
        };
        $.ajax({
            url: app.baseServerUrl + '/sign_in/id',
            method: 'POST',
            data: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            success: function (response) {
                localStorage.uid = response.uid;
                if (response.clothing){
                    app.setWarmLevel(response.clothing.warm_level);
                    localStorage.clothing = response.clothing;
                }
                app.loginSuccess(user);
            }
        });
    }
};