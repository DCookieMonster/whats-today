var app = window.app || {};
var clothClass = document.getElementsByClassName('cloth');
for (var i = 0; i < clothClass.length; i++) {
    clothClass[i].addEventListener('click', function () {
            // if (localStorage.uid == null) {
            //     document.querySelector('.dialog-container-2').classList.add('dialog-container-2--visible');
            // }
            if (!app.temp && app.temp == '') {
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
            app.LevelChosen();
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
            app.LevelChosen();
        }

    }

};

app.LevelChosen = function () {
    var wearingCard = document.querySelector('.choose-clothing');
    $(wearingCard).hide();
    var feedback = document.querySelector('.feedback');
    $(feedback).show();
};

app.LevelUnChosen = function () {
    var wearingCard = document.querySelector('.choose-clothing');
    $(wearingCard).show();
    var feedback = document.querySelector('.feedback');
    $(feedback).hide();
};

document.getElementById('editLevel').addEventListener('click', function () {
    app.LevelUnChosen();
});

app.feelingChosen = function () {
    var feedbackBtns = document.querySelector('.feedback-btns');
    $(feedbackBtns).remove();
    var feedbackHeader = document.querySelector('.feedback-header');
    feedbackHeader.textContent = "Thank You For Your Feedback";
    setTimeout(function () {
        var feedback = document.querySelector('.feedback');
        $(feedback).hide();
    }, 1500);

};

function sendDataToFeelingServer(data) {
    fetch(app.baseServerUrl + '/warm_level/feeling', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

}

var feelingBtn = document.getElementsByClassName('feeling-btn');
for (var j = 0; j < feelingBtn.length; j++) {
    feelingBtn[j].addEventListener('click', function () {
        var data = {
            feeling: this.textContent.toLowerCase(),
            uid: localStorage.uid,
            time: new Date().getTime()
        };
        sendDataToFeelingServer(data);
        app.feelingChosen();
        }
    )
}
