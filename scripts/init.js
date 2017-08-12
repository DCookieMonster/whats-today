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
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    baseServerUrl: 'https://whats-today.herokuapp.com', //'http://localhost:3000', //
    city: '',
    temp: '',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
};


if (!localStorage.uid || localStorage.uid == ''){
    var sign_in = document.querySelector('.sign-in');
    $(sign_in).hide();
}