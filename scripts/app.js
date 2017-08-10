// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


(function() {
  'use strict';
  window.app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: {},
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    baseServerUrl:'http://localhost:3000', // 'https://whats-today.herokuapp.com', //
    city: '',
    temp: '',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  var app = window.app;

  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('butRefresh').addEventListener('click', function() {
    // Refresh all of the forecasts
    app.updateForecasts();
  });

  document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  document.getElementById('butAddCity').addEventListener('click', function() {
    // Add the newly selected city
    var selected = document.getElementById('selectCityToAdd');
    // var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var label = selected.value;
    remove();
    app.getForecast(key, label);
    app.selectedCities = {
      key: key,
      label: label
    };
    app.saveSelectedCities();
    app.toggleAddDialog(false);
  });

    function remove() {
        $(app.visibleCards[app.city.toLowerCase()]).remove();
        app.visibleCards = [];
    }

  document.getElementById('butAddCancel').addEventListener('click', function() {
    // Close the add new city dialog
    app.toggleAddDialog(false);
  });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function(data) {

    var dataLastUpdated = new Date(data.created);
    var sunrise = data.channel.astronomy.sunrise;
    var sunset = data.channel.astronomy.sunset;
    var current = data.channel.item.condition;
    var humidity = data.channel.atmosphere.humidity;
    var wind = data.channel.wind;

    var card = app.visibleCards[data.key.toLowerCase()];
    var loc = data.channel.location;
    var city = '';
    var country = '';
    if (loc) {
      city = loc.city;
      country = loc.country;
    } else {
      return
    }
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      if (data.key == '') {
        card.querySelector('.butDelete').textContent = 'gps_fixed';
      } else {
        card.querySelector('.butDelete').onclick = function() {
          app.deleteCity(this.parentElement.parentElement.parentElement.querySelector('.city-id').textContent);
        };
        card.querySelector('.butDelete').style.cursor = 'pointer';
      }
      card.classList.remove('cardTemplate');
      card.querySelector('.location').textContent = city + ', ' + country;
      card.querySelector('.city-key').textContent = city + ', ' + country;
      app.city = city;
      card.querySelector('.city-id').textContent = data.key;
      data.key = city;
      data.label = city;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[city.toLowerCase()] = card;
    }

    // Verifies the data provide is newer than what's already visible
    // on the card, if it's not bail, if it is, continue and update the
    // time saved in the card
    var cardLastUpdatedElem = card.querySelector('.card-last-updated');
    var cardLastUpdated = cardLastUpdatedElem.textContent;
    if (cardLastUpdated) {
      cardLastUpdated = new Date(cardLastUpdated);
      // Bail if the card has more recent data then the data
      if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
        return;
      }
    }
    cardLastUpdatedElem.textContent = data.created;

    card.querySelector('.description').textContent = current.text;
    card.querySelector('.date').textContent = current.date;
    card.querySelector('.current .icon').classList.add(app.getIconClass(current.code));
    card.querySelector('.current .temperature .value').textContent =
      Math.round(current.temp);
    app.temp = Math.round(current.temp);
    card.querySelector('.current .humidity').textContent =
      Math.round(humidity) + '%';
    var nextDays = card.querySelectorAll('.future .oneday');
    var today = new Date();
    today = today.getDay();
    for (var i = 0; i < 7; i++) {
      var nextDay = nextDays[i];
      var daily = data.channel.item.forecast[i];
      if (daily && nextDay) {
        nextDay.querySelector('.date').textContent =
          app.daysOfWeek[(i + today) % 7];
        nextDay.querySelector('.icon').classList.add(app.getIconClass(daily.code));
        nextDay.querySelector('.temp-high .value').textContent =
          Math.round(daily.high);
        nextDay.querySelector('.temp-low .value').textContent =
          Math.round(daily.low);
      }
    }
    var latitude = data.channel.item.lat;
    var longitude = data.channel.item.long;
    app.getYesterdayWeatherByLocation(data.key, {
      'latitude': latitude,
      'longitude': longitude
    });
  };

  app.updateYesterdayForecastCard = function(data) {
    var dataLastUpdated = new Date(data.created);
    var card = app.visibleCards[data.key.toLowerCase()];
    var daily = data.daily;
    var dailyData = daily.data;
    // Verifies the data provide is newer than what's already visible
    // on the card, if it's not bail, if it is, continue and update the
    // time saved in the card
    var cardLastUpdatedElem = card.querySelector('.card-last-updated');
    var cardLastUpdated = cardLastUpdatedElem.textContent;
    if (cardLastUpdated) {
      cardLastUpdated = new Date(cardLastUpdated);
      // Bail if the card has more recent data then the data
      if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
        return;
      }
    }
    cardLastUpdatedElem.textContent = data.created;
    var currentTemp = parseInt(card.querySelector('.current .temperature .value').textContent);
    var yesterdayTempInfo = dailyData[0];
    var minTemp = yesterdayTempInfo.apparentTemperatureMin;
    var maxTemp = yesterdayTempInfo.apparentTemperatureMax;
    var avgTemp = (maxTemp + minTemp) / 2;
    var diffTemp = Math.floor(currentTemp - avgTemp);
    var tempText = ' Difference';
    if (diffTemp > 0) {
      tempText = ' Colder';
    } else if (diffTemp < 0) {
      tempText = ' Wormer';
    }
    card.querySelector('.current .yesterday .yesterday-diff').textContent = Math.abs(diffTemp);
    card.querySelector('.current .yesterday .yesterday-info').textContent = tempText + " From Yesterday";

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };


  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  /*
   * Gets a forecast for a specific city and updates the card with the data.
   * getForecast() first checks if the weather data is in the cache. If so,
   * then it gets that data and populates the card with the cached data.
   * Then, getForecast() goes to the network for fresh data. If the network
   * request goes through, then the card gets updated a second time with the
   * freshest data.
   */
  app.getForecast = function(key, label, loc = '') {
    label = key;
    var statement = "select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + label + "') and u='c'";
    // var statement = "select * from weather.forecast where u='c' and woeid=" + key ;
    if (loc != '') {
      var longitude = loc['longitude']
      var latitude = loc['latitude']
      statement = 'select * from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text="(' + latitude + ',' + longitude + ')")' + " and u='c'"
    }
    var url = 'https://query.yahooapis.com/v1/public/yql?format=json&q=' +
      statement;
    // TODO add cache logic here
    if ('caches' in window) {
      /*
       * Check if the service worker has already cached this city's weather
       * data. If the service worker has the data, then display the cached
       * data while the app fetches the latest data.
       */
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            var results = json.query.results;
            results.key = key;
            results.label = label;
            results.created = json.query.created;
            app.updateForecastCard(results);
          });
        }
      });
    }
    // Fetch the latest data.
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var results = response.query.results;
          results.key = key;
          results.label = label;
          results.created = response.query.created;
          app.updateForecastCard(results);
        }
      } else {
        // Return the initial weather forecast since no data is available.
        app.updateForecastCard(initialWeatherForecast);
      }
    };
    request.open('GET', url);
    request.send();
  };

  app.getYesterdayWeatherByLocation = function(key, loc = '') {
    if (loc == '') {
      return;
    }
    var baseUrl = 'https://api.darksky.net/forecast/82b05953baf3b7b7396dddd452886009/';
    var extraParams = '?exclude=currently,flags,hourly,alerts,minutely&units=ca';
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = Math.floor(yesterday / 1000)
    var longitude = loc['longitude']
    var latitude = loc['latitude']
    var url = baseUrl + latitude + ',' + longitude + ',' + yesterday + extraParams
      // TODO add cache logic here
    if ('caches' in window) {
      /*
       * Check if the service worker has already cached this city's weather
       * data. If the service worker has the data, then display the cached
       * data while the app fetches the latest data.
       */
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            var results = json.query.results;
            results.created = json.query.created;
            results.key = key;
            app.updateYesterdayForecastCard(results);
          });
        }
      });
    }
    $.ajax({
      url: url,
      method: 'GET',
      dataType: 'jsonp',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': true
      },
      success: function(response) {
        var results = response;
        results.key = key;
        results.created = new Date();
        app.updateYesterdayForecastCard(results);
      }
    });
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function() {
    if (!app.isLoading) {
      app.spinner.removeAttribute('hidden');
      app.isLoading = true;
    }
    var keys = Object.keys(app.visibleCards);
    if (keys.length == 0){
      app.getGPSForcasts()
    }
    keys.forEach(function(key) {
      app.getForecast(key);
    });
    if (keys.length == 0){
       if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
    }
  };

  app.getGPSForcasts = function () {
      navigator.geolocation.getCurrentPosition(function(location) {
          app.getForecast('', '', {
              'latitude': location.coords.latitude,
              'longitude': location.coords.longitude
          });
      });
  }

  app.deleteCity = function(city) {
    app.selectedCities = null;
    delete app.visibleCards[city.toLowerCase()];
    var cards = document.getElementsByClassName('card');
    for (var i = cards.length - 1; i >= 0; i--) {
      var cityCard = cards[i].querySelector('.city-id');
        if (cityCard){
        var cityId = cityCard.textContent;
            if (cityId == city){
                $(cards[i]).remove();
            }
        }

    }
    app.saveSelectedCities();
    app.updateForecasts();
  }

  // TODO add saveSelectedCities function here
  // Save list of cities to localStorage.
  app.saveSelectedCities = function() {
    var selectedCities = JSON.stringify(app.selectedCities);
    localStorage.selectedCities = selectedCities;
  };

  app.getIconClass = function(weatherCode) {
    // Weather codes: https://developer.yahoo.com/weather/documentation.html#codes
    weatherCode = parseInt(weatherCode);
    switch (weatherCode) {
      case 25: // cold
      case 32: // sunny
      case 33: // fair (night)
      case 34: // fair (day)
      case 36: // hot
      case 3200: // not available
        return 'clear-day';
      case 0: // tornado
      case 1: // tropical storm
      case 2: // hurricane
      case 6: // mixed rain and sleet
      case 8: // freezing drizzle
      case 9: // drizzle
      case 10: // freezing rain
      case 11: // showers
      case 12: // showers
      case 17: // hail
      case 35: // mixed rain and hail
      case 40: // scattered showers
        return 'rain';
      case 3: // severe thunderstorms
      case 4: // thunderstorms
      case 37: // isolated thunderstorms
      case 38: // scattered thunderstorms
      case 39: // scattered thunderstorms (not a typo)
      case 45: // thundershowers
      case 47: // isolated thundershowers
        return 'thunderstorms';
      case 5: // mixed rain and snow
      case 7: // mixed snow and sleet
      case 13: // snow flurries
      case 14: // light snow showers
      case 16: // snow
      case 18: // sleet
      case 41: // heavy snow
      case 42: // scattered snow showers
      case 43: // heavy snow
      case 46: // snow showers
        return 'snow';
      case 15: // blowing snow
      case 19: // dust
      case 20: // foggy
      case 21: // haze
      case 22: // smoky
        return 'fog';
      case 24: // windy
      case 23: // blustery
        return 'windy';
      case 26: // cloudy
      case 27: // mostly cloudy (night)
      case 28: // mostly cloudy (day)
      case 31: // clear (night)
        return 'cloudy';
      case 29: // partly cloudy (night)
      case 30: // partly cloudy (day)
      case 44: // partly cloudy
        return 'partly-cloudy-day';
    }
  };

  /*
   * Fake weather data that is presented when the user first uses the app,
   * or when the user has not saved any cities. See startup code for more
   * discussion.
   */
  var initialWeatherForecast = {
    key: '2459115',
    label: 'New York, NY',
    created: '2016-07-22T01:00:00Z',
    channel: {
      astronomy: {
        sunrise: "5:43 am",
        sunset: "8:21 pm"
      },
      item: {
        condition: {
          text: "Windy",
          date: "Thu, 21 Jul 2016 09:00 PM EDT",
          temp: 56,
          code: 24
        },
        forecast: [{
          code: 44,
          high: 86,
          low: 70
        }, {
          code: 44,
          high: 94,
          low: 73
        }, {
          code: 4,
          high: 95,
          low: 78
        }, {
          code: 24,
          high: 75,
          low: 89
        }, {
          code: 24,
          high: 89,
          low: 77
        }, {
          code: 44,
          high: 92,
          low: 79
        }, {
          code: 44,
          high: 89,
          low: 77
        }]
      },
      atmosphere: {
        humidity: 56
      },
      wind: {
        speed: 25,
        direction: 195
      }
    }
  };
  // TODO uncomment line below to test app with fake data
  // app.updateForecastCard(initialWeatherForecast);

  /************************************************************************
   *
   * Code required to start the app
   *
   * NOTE: To simplify this codelab, we've used localStorage.
   *   localStorage is a synchronous API and has serious performance
   *   implications. It should not be used in production applications!
   *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
   *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
   ************************************************************************/
  // Check for Geolocation API permissions  
  // navigator.permissions.query({
  //     name: 'geolocation'
  //   })
  //   .then(function(permissionStatus) {
  //     if (permissionStatus.state == 'granted') {
  //       navigator.geolocation.getCurrentPosition(function(location) {
  //         console.log(location.coords.latitude);
  //         console.log(location.coords.longitude);
  //         app.getForecast('', '', {
  //           'latitude': location.coords.latitude,
  //           'longitude': location.coords.longitude
  //         });
  //       });
  //     }
  //     console.log('geolocation permission state is ', permissionStatus.state);

  //     permissionStatus.onchange = function() {
  //       console.log('geolocation permission state has changed to ', this.state);
  //       if (permissionStatus.state == 'granted') {
  //         navigator.geolocation.getCurrentPosition(function(location) {
  //           console.log(location.coords.latitude);
  //           console.log(location.coords.longitude);
  //           app.getForecast('', '', {
  //             'latitude': location.coords.latitude,
  //             'longitude': location.coords.longitude
  //           });
  //         });
  //       }
  //     };
  //   });

  // TODO add startup code here
  app.selectedCities = localStorage.selectedCities;
  if (app.selectedCities && app.selectedCities == null && app.selectedCities != {}) {

    app.selectedCities = JSON.parse(app.selectedCities);
    app.getForecast(app.selectedCities.key, app.selectedCities.label);

    // app.selectedCities.forEach(function(city) {
    //   app.getForecast(city.key, city.label);
    // });
  } else {
      navigator.geolocation.getCurrentPosition(function(location) {
          app.getForecast('', '', {
              'latitude': location.coords.latitude,
              'longitude': location.coords.longitude
          });
      });
    /* The user is using the app for the first time, or the user has not
     * saved any cities, so show the user some fake data. A real app in this
     * scenario could guess the user's location via IP lookup and then inject
     * that data into the page.
     */
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  }

  // TODO add service worker code here
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./serviceWorker.js')
      .then(function() {
        console.log('Service Worker Registered');
      });
       //Listen postMessage when `background sync` is triggered
  navigator.serviceWorker.addEventListener('message', function (event) {
    console.info('From background sync: ', event.data);
    fetchGitUserInfo(localStorage.getItem('request'), true);
    bgSyncElement.classList.remove('hide'); //Once sync event fires, show register toggle button
    bgSyncTextElement.setAttribute('hidden', true); //Once sync event fires, remove registered label
  });
  }

})();


