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
        localStorage.feeling = false;
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
    var feedback = document.querySelector('.feedback');
    if (app.afterNoon()){
        $(feedback).show();
    }
    var edit = document.getElementById('editLevel');
    $(edit).show();
    var levels = document.querySelector('.levels');
    $(levels).hide();
    if (localStorage.feeling == 'true'){
        if (!app.afterNoon()){
            return;
        }
        app.feelingChosen(false);
        return;
    }
};

app.reFeedback = function () {
    var edit = document.getElementById('editFeedback');
    $(edit).hide();
    var feedback = document.querySelector('.feedback-btns');
    $(feedback).show();
    var feedbackSubtitle = document.querySelector('.feedback-subtitle');
    $(feedbackSubtitle).show();
};

app.reChooseLevel = function () {
    var edit = document.getElementById('editLevel');
    $(edit).hide();
    var levels = document.querySelector('.levels');
    $(levels).show();
};

document.getElementById('editFeedback').addEventListener('click', function () {
    app.reFeedback();
});

document.getElementById('editLevel').addEventListener('click', function () {
    app.reChooseLevel();
});

app.afterNoon = function() {
    var date = new Date();
    var hours = date.getHours();
    if (hours >= 16){
        return true;
    }
    return false;
}

app.feelingChosen = function (withToast) {
    if (withToast){
        toast('Thank You For Your Feedback');
    }
    var edit = document.getElementById('editFeedback');
    $(edit).show();
    var feedback = document.querySelector('.feedback-btns');
    $(feedback).hide();
    var feedbackSubtitle = document.querySelector('.feedback-subtitle');
    $(feedbackSubtitle).hide();
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
        localStorage.feeling = true;
        sendDataToFeelingServer(data);
        if (!app.afterNoon()){
            return;
        }
        app.feelingChosen(true);
        }
    )
}

app.recommendedClothing = function (user_id, temp) {
    $.ajax({
        url: app.baseServerUrl + '/warm_level/recommended?uid=' + user_id + '&temp=' + temp,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        success: function (response) {
            var recommended = response.recommended;
            if (Object.keys(recommended).length === 0 && recommended.constructor === Object){
                return;
            }
            var card = document.querySelector('.recommended-card');
            // card.querySelector('.icon').classList.add(recommended.warm_level);
            card.querySelector('.icon').innerHTML =
                '<img width="50px" src="images/warm_levels/' + recommended.warm_level + '.png">';
            card.querySelector('.recommended-temperature .value').textContent = recommended.temp;
            card.querySelector('.recommended-feeling').textContent = recommended.feeling;
            var date = new Date(recommended.created_at);
            var date_s = date.getDate() + '/' + (date.getMonth() + 1) + '/' +  date.getFullYear();
            // card.querySelector('.recommended-time').textContent = date_s;
            // card.querySelector('.recommended-place').textContent = recommended.city;
            $(card).show();
        }
    });
};