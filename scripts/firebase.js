// Initialize Firebase
var app = window.app || {};
var provider = new firebase.auth.GoogleAuthProvider();

var googleSigninElement = document.querySelector('.google_signing');
//Click event for subscribe push
googleSigninElement.addEventListener('click', function () {
    firebase.auth().signInWithRedirect(provider);
});

var googleSigninLogoElement = document.querySelector('.google-auth');
//Click event for subscribe push
googleSigninLogoElement.addEventListener('click', function () {
    firebase.auth().signInWithRedirect(provider);
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
    if (user.photoURL.length > 1) {
        $(googleButton).empty();
        googleButton.innerHTML = "<img src='" + user.photoURL + "' width='100%'>";
    }
    var clothing = document.querySelector('.choose-clothing');
    $(clothing).show();
    var sign_in = document.querySelector('.sign-in');
    $(sign_in).hide();
    app.recommendedClothing(localStorage.uid, app.temp);
};

app.failedLogin = function() {
    var sign_in = document.querySelector('.sign-in');
    $(sign_in).show();
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
                    localStorage.clothing = JSON.stringify(response.clothing);
                }
                app.loginSuccess(user);
            },
            error: function (response) {
                app.failedLogin();

            }
        });
    }
};