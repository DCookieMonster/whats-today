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
var uiConfig = {
    signInSuccessUrl: '/',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: '/'
};
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

var googleSigninElement = document.querySelector('.google_signing');
//Click event for subscribe push
googleSigninElement.addEventListener('click', function () {
    var isSubscribed = (googleSigninElement.dataset.checked === 'true');
    if (isSubscribed) {
        // Initialize the FirebaseUI Widget using Firebase.

        toggleAddDialog2(true)
    }
    else {
        toggleAddDialog2(true)

    }
});
var addDialog = document.querySelector('.dialog-container-2');
// Toggles the visibility of the add new city dialog.
 var toggleAddDialog2 = function(visible) {
    if (visible) {
        addDialog.classList.add('dialog-container-2--visible');
    } else {
        addDialog.classList.remove('dialog-container-2--visible');
    }
};

initApp = function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var phoneNumber = user.phoneNumber;
            var providerData = user.providerData;
            // var url_pref = 'https://whats-today.herokuapp.com';
            var url_pref = 'http://localhost:3000';
            localStorage.uid = uid;
            localStorage.user = user;
            var data = {uid: uid, email: email, displayName: displayName, providerData: providerData, user: user};
            //Form data with info to send to server
            fetch(url_pref + '/sign_in', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(function(response) {
                    return response.json();
                })
            // user.getIdToken().then(function(accessToken) {
            //     // document.getElementById('sign-in-status').textContent = 'Signed in';
            //     // document.getElementById('sign-in').textContent = 'Sign out';
            //     document.getElementById('account-details').textContent = JSON.stringify({
            //         displayName: displayName,
            //         email: email,
            //         emailVerified: emailVerified,
            //         phoneNumber: phoneNumber,
            //         photoURL: photoURL,
            //         uid: uid,
            //         accessToken: accessToken,
            //         providerData: providerData
            //     }, null, '  ');
            // });
        } else {
            // // User is signed out.
            // document.getElementById('sign-in-status').textContent = 'Signed out';
            // document.getElementById('sign-in').textContent = 'Sign in';
            // document.getElementById('account-details').textContent = 'null';
        }
    }, function(error) {
        console.log(error);
    });
};

window.addEventListener('load', function() {
    initApp()
});