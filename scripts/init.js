var config = {
    apiKey: "AIzaSyCmvpuvKQdVzaZYpIRz6paxjUkFZpclp3k",
    authDomain: "whats-today-pwa.firebaseapp.com",
    databaseURL: "https://whats-today-pwa.firebaseio.com",
    projectId: "whats-today-pwa",
    storageBucket: "whats-today-pwa.appspot.com",
    messagingSenderId: "295179172065"
};
firebase.initializeApp(config);

window.app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: {},
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    futureCardTemplate: document.querySelector('.future-forecast'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    baseServerUrl: 'http://localhost:3000', //'https://whats-today.herokuapp.com', //
    city: '',
    temp: '',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
};

if (!localStorage.uid || localStorage.uid == '') {
    var sign_in = document.querySelector('.sign-in');
    $(sign_in).hide();
}