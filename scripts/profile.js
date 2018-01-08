const app = window.app || {};

app['profile'] = {
    cardTemplate: document.querySelector('.historyCard'),
    container: document.querySelector('.historyContainer')
};

const profile = app.profile;

function history_data() {
    const user_id = localStorage.uid;
    $.ajax({
        url: app.baseServerUrl + '/users/' + user_id + '/history',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        success: function (response) {
            // console.log(response.history);
            response.history.forEach(function (data) {
                buildHistoryCard(data)
            });
            $('.loader').hide();

        }
    });

}

function buildHistoryCard(data) {
    const card = profile.cardTemplate.cloneNode(true);
    card.querySelector('.icon').innerHTML =
        '<img width="50px" src="images/warm_levels/' + data.warm_level + '.png">';
    card.querySelector('.recommended-temperature .value').textContent = data.temp;
    if (data.feeling !== undefined){
        $(card.querySelector('.feelingText')).show();
        card.querySelector('.recommended-feeling').textContent = jsUcfirst(data.feeling);

    }
    card.removeAttribute('hidden');
    profile.container.appendChild(card);
    const date = new Date(data.created_at);
    card.querySelector('.dateHistory').textContent =
        date.getDate() + '/' + (date.getMonth() + 1) + '/' +  date.getFullYear();
    card.querySelector('.placeHistory').textContent = data.city;
}

function jsUcfirst(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function greetings() {
    const d = new Date();
    const time = d.getHours();
    const spanGreetings = document.querySelector('.greetings');
    if (time < 12)
    {
        spanGreetings.textContent = 'Good Morning,';
        return;
    }
    if (time < 18)
    {
        spanGreetings.textContent = 'Good Afternoon,';
        return;
    }
    if (time < 22)
    {
        spanGreetings.textContent = 'Good Evening,';
        return;
    }
    spanGreetings.textContent = 'Good Night,';

}
history_data();
greetings();

const user = JSON.parse(localStorage.user);
if (user.displayName){
    document.querySelector('.name').textContent = user.displayName;
    document.querySelector('.btn-floating-profile').src = user.photoURL;

}else{
    document.querySelector('.name').textContent = 'You'
}

const signOutElement = document.getElementById('signOut');
//Click event for subscribe push
signOutElement.addEventListener('click', function () {
    localStorage.removeItem('uid');
    var googleButton = document.querySelector('.google_signing');
    googleButton.innerHTML = '<a style="opacity: 1;"><i class="material-icons">person_outline</i></a>';
    location.href = 'index.html'
});
