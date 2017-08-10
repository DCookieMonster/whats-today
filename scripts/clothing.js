var app = window.app || {};
var clothClass = document.getElementsByClassName('cloth');
for (var i = 0; i < clothClass.length; i++) {
    clothClass[i].addEventListener('click', function () {
            // if (localStorage.uid == null) {
            //     document.querySelector('.dialog-container-2').classList.add('dialog-container-2--visible');
            // }
            if (!app.city && app.city == '' && !app.temp) {
                return;
            }
            var clothClass = document.getElementsByClassName('cloth');
            for (var i = 0; i < clothClass.length; i++) {
                if (clothClass[i].classList.contains('Filled')) {
                    var pref = clothClass[i].src.split('-f.png')[0];
                    clothClass[i].src = pref + '.png';
                    clothClass[i].classList.remove('Filled');
                }
            }
            this.className += ' Filled';
            var src = this.src;
            var pref = src.split('.png')[0];
            this.src = pref + '-f.png';
            var clothing = pref.split('/');
            var data = {
                warm_level: clothing[clothing.length - 1],
                city: app.city,
                temp: app.temp,
                uid: localStorage.uid,
                time: new Date().getTime()
            };
            sendDataToClothingServer(data);

        }
    )
}

function sendDataToClothingServer(data) {
    fetch(app.baseServerUrl + '/warm_level', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

}

app.setWarmLevel = function (warmLevel) {
    var clothClass = document.getElementsByClassName('cloth');
    for (var i = 0; i < clothClass.length; i++) {
        var src = clothClass[i].src;
        var pref = src.split('.png')[0].split('/');
        var warmLevelID = pref[pref.length - 1];
        if (warmLevel == warmLevelID) {
            clothClass[i].className += ' Filled';
            var src = clothClass[i].src;
            var pref = src.split('.png')[0];
            clothClass[i].src = pref + '-f.png';
        }

    }
}
