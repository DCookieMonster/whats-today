
// (function() {
//     'use strict';
    var app = window.app;

    var clothClass = document.getElementsByClassName('cloth');
    for (var i = 0; i < clothClass.length; i++) {
        clothClass[i].addEventListener('click', function () {
                if (localStorage.uid == null) {
                    document.querySelector('.dialog-container-2').classList.add('dialog-container-2--visible');
                }
                if (this.classList.contains('Filled')) {
                    this.className = 'center cloth';
                    var src = this.src;
                    var pref = src.split('-f')[0];
                    this.src = pref + '.png'
                    var clothing = pref.split('/');
                    var data = {
                        chosen_cloth: clothing[clothing.length - 1],
                        city: app.city,
                        temp: app.temp,
                        uid: localStorage.uid
                    };
                    sendDataToClothingServer(data, false)

                }
                else {
                    this.className += ' Filled';
                    var src = this.src;
                    var pref = src.split('.png')[0];
                    this.src = pref + '-f.png';
                    var clothing = pref.split('/');
                    var data = {
                        chosen_cloth: clothing[clothing.length - 1],
                        city: app.city,
                        temp: app.temp,
                        uid: localStorage.uid
                    };
                    sendDataToClothingServer(data, true)

                }

            }
        )
    }


    // app.clothing = {
    //     coat: false,
    //     umbrella: false,
    //     shorts: false,
    //     t_shirt: false,
    //     shirt: false,
    //     boots: false,
    //     skirt: false,
    //     trousers: false,
    //     scarf: false,
    //     flip_flop: false,
    //     mittens: false,
    //     shoes: false
    // };
// });

function sendDataToClothingServer(data, chose_clothing) {
    if (chose_clothing){
        var sefix = 'chose_clothing';
    }
    else{
        var sefix = 'unchose_clothing'
    }
    // fetch(app.baseServerUrl + '/' + sefix, {
    //     method: 'post',
    //     headers: {
    //         'Accept': 'application/json',
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(data)
    // })
    //     .then(function (response) {
    //         return response.json();
    //     })

}