(function() {
  'use strict';
  var cors = 'http://knickj.com:5000/';
  var app = {
    creating_playlist: false,
    isLoading: true,
    visibleCards: new Map(),
    selectedCards: new Map(),
    selectedServices: new Set(),
    spinner: document.querySelector('.loaderContainer'),
    scroller: document.querySelector('.scrollLoad'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main')
  };

  app.getMovies = function() {
    //console.log(page_number);
    var providers = "";
    app.selectedServices.forEach(function(service) {
      providers += '%22'+ service + '%22,';
    });
    var url_str = 'https://apis.justwatch.com/content/titles/en_US/popular?body=%7B%22age_certifications%22:null,%22content_types%22:%5B%22movie%22%5D,%22genres%22:null,%22languages%22:null,%22max_price%22:null,%22min_price%22:null,%22monetization_types%22:%5B%22free%22,%22ads%22,%22flatrate%22%5D,%22page%22:{page_number},%22page_size%22:100,%22presentation_types%22:null,%22providers%22:%5B'+providers.substring(0, providers.length - 1)+'%5D,%22release_year_from%22:null,%22release_year_until%22:null,%22scoring_filter_types%22:null,%22timeline_type%22:null%7D';
    var url = url_str.replace("{page_number}",page_number);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var results = response.items;
          total_pages = response.total_pages;
          app.updateMovieCards(results);
        }
      } else {
        //console.log(request.readyState);
      }
    };
    request.open('GET', cors+url);
    request.send();
  };

  app.updateMovieCards = function(data) {
    for (var i = 0; i < data.length; i++) {
      var movie_data = data[i];
      //var movie_id = data[i].id;
      app.updateMovieCard(movie_data); //.then(
      //app.getStreamLink(movie_id));
    }
    if (app.isLoading) {
      app.scroller.removeAttribute('hidden');
      app.spinner.setAttribute('hidden',true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };

  app.getStreamLink = function(id) {
    var url = 'https://apis.justwatch.com/content/titles/movie/{id}/locale/en_US';
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var result = response;
          app.updateStreamLink(result);
        }
      } else {
        //nothing for now
      }
    };
    request.open('GET', cors+url.replace("{id}",id));
    request.send();
  }

  app.getProviderID = function(provider) {
    switch (providerCode) {
      case 8:
        return 'netflix';
      case 31: 
        return 'hbo_go';
      case 123:
        return 'fx_networks';
      case 43: 
        return 'starz';
      case 15:
        return 'hulu';
      case 34: 
        return 'epix';
      case 9:
        return 'amazon';
      case 27: 
        return 'hbo_now';
    }
  }

  app.updateStreamLink = function(data) {
    //console.log(data.title);
    for (var i = 0; i < data.offers.length; i++) {
      var offer = data.offers[i];

      if (offer.monetization_type == 'flatrate' && offer.presentation_type == 'hd') {
        var watch_url_init = offer.urls.standard_web;
        //console.log(watch_url_init + ' ' +offer.provider_id);
        //should be using provider id
        if (offer.provider_id == '8') {
          var watch_url = watch_url_init.replace("title","watch");
          //console.log(watch_url);
          var card = app.visibleCards.get(data.id);
          //card.addEventListener('click', function() {
            window.open(watch_url,"_self")
          //});
          break;
        }
        else if (offer.provider_id == '31') {
          var watch_url = watch_url_init + '?autoplay=true';
          //console.log(watch_url);
          var card = app.visibleCards.get(data.id);
          //card.addEventListener('click', function() {
            window.open(watch_url,"_self")
          //});
          break;
        }
        else if (offer.provider_id == '9') {
          var watch_url = watch_url_init.substring(0, watch_url_init.indexOf('?')) + '/ref=atv_dp_pb_core?autoplay=1&t=3';
          //console.log(watch_url);
          var card = app.visibleCards.get(data.id);
          //card.addEventListener('click', function() {
            window.open(watch_url,"_self")
          //});
          break;
        }
        else if (offer.provider_id == '37') {
          var watch_url = watch_url_init.replace("showtime","showtimeanytime").replace('#\/movie','#play');
          //console.log(watch_url);
          var card = app.visibleCards.get(data.id);
          //card.addEventListener('click', function() {
            window.open(watch_url,"_self")
          //});
          break;
        }
      }
    }
  }

  app.updateMovieCard = function(item) {
      //console.log(item);
  
      //var dataLastUpdated = new Date(data.created);
      var profile = 's332';

      var card = app.visibleCards.get(item.id);
      if (!card) {
        card = app.cardTemplate.cloneNode(true);
        card.classList.remove('cardTemplate');
        card.querySelector('.id').textContent = item.id;
        card.querySelector('.original_title').textContent = item.title;
        var poster_url = item.poster;
        if (poster_url){
          card.querySelector('.poster').src = 'https://images.justwatch.com' + poster_url.replace("{profile}",profile);
        } else {
          card.querySelector('.original_title').removeAttribute('hidden');
        }
	card.addEventListener('click', function() {
		app.getStreamLink(item.id);
	});

        card.querySelector('#roulette').addEventListener('click', function(event) {
          if (app.creating_playlist) {
            event.stopPropagation();
            if (app.selectedCards.has(item.id)){
              card.querySelector('#roulette').classList.remove("selected");
              app.selectedCards.delete(item.id);
            } else {
              card.querySelector('#roulette').className += " selected";
              app.selectedCards.set(item.id,card);
            }
              //console.log(app.selectedCards);
	  }
        });
        card.removeAttribute('hidden');
	//card.querySelector('#roulette').classList.remove('hidden');
        app.container.insertBefore(card,app.scroller);
        app.visibleCards.set(item.id,card);
      }
      //return new Promise(function (resolve, reject) {
      //  resolve();
      //});
  };

var distToBottom;
var page_number = 1;
var total_pages = 0;
var contentContainer = document.getElementsByClassName('content-container')[0];
var loadingContainer = document.getElementsByClassName('loading-container')[0];

function getDistFromBottom () {
  
  var scrollPosition = app.container.scrollTop;
  var windowSize     = window.innerHeight;
  var bodyHeight     = app.container.scrollHeight;

  return Math.max(bodyHeight - (scrollPosition + windowSize), 0);

}

app.container.addEventListener('scroll', function() {

  distToBottom = getDistFromBottom();
  //console.log('scrolling', getDistFromBottom());

  if (!app.isLoading && distToBottom <= 8000 && page_number != total_pages && app.visibleCards.size > 0) {
    app.isLoading = true;

    page_number++;
    app.getMovies();
  }
});

document.getElementById('playRandom').addEventListener('click', function() {
  app.spinner.removeAttribute('hidden');
  app.playRandomMovie(true);
});

var serviceButtons = document.querySelectorAll('.serviceButton');
serviceButtons.forEach(function(button) {
  app.selectedServices.add(button.id);
  button.addEventListener('click', function() {
    if (app.selectedServices.has(button.id)) {
      button.classList.remove("selected");
      app.selectedServices.delete(button.id);
      app.updateSelectedServices();
    } else {
      button.className += " selected";
      app.selectedServices.add(button.id);
      app.updateSelectedServices();
    }
  });
});

document.getElementById('addList').addEventListener('click', function() {
  if (app.creating_playlist){
    app.creating_playlist = false;
    app.selectedCards.clear();
    var roulettes = document.querySelectorAll('.roulette_button');
    roulettes.forEach(function(item) { 
	    item.classList.add('hidden');
	    item.classList.remove("selected");
    })
  } else {
    app.creating_playlist = true;
    var roulettes = document.querySelectorAll('.roulette_button');
    roulettes.forEach(function(item) { item.classList.remove('hidden'); })
  }
});

app.updateSelectedServices = function () {
  app.isLoading = true;
  app.spinner.removeAttribute('hidden');
  app.scroller.setAttribute('hidden',true);
  app.visibleCards.forEach(function(card) {
    app.container.removeChild(card);
  })
  app.visibleCards.clear();
  page_number = 1;
  total_pages = 0;
  app.creating_playlist = false;
  app.selectedCards.clear();
  app.cardTemplate.querySelector('#roulette').classList.add('hidden');
  app.getMovies();
}

app.simulateClick = function (elem) {
  // Create our event (with options)
  var evt = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  // If cancelled, don't dispatch our event
  var canceled = !elem.dispatchEvent(evt);
};

app.playRandomMovie = function() {

  if (app.selectedCards.size != 0) {
    //console.log(app.selectedCards);
    var roulette_array = Array.from(app.selectedCards.keys());
    //console.log(roulette_array);
    var item = roulette_array[Math.floor(Math.random()*roulette_array.length)];
    //console.log(app.selectedCards.get(item));
    app.simulateClick(app.selectedCards.get(item));
  }
  else {
    var providers = "";
    app.selectedServices.forEach(function(service) {
      providers += '%22'+ service + '%22,';
    });
    var url = 'https://apis.justwatch.com/content/titles/en_US/popular?body=%7B%22age_certifications%22:null,%22content_types%22:%5B%22movie%22%5D,%22genres%22:null,%22languages%22:null,%22max_price%22:null,%22min_price%22:null,%22monetization_types%22:%5B%22free%22,%22ads%22,%22flatrate%22%5D,%22page%22:1,%22page_size%22:999999,%22presentation_types%22:null,%22providers%22:%5B'+providers.substring(0, providers.length - 1)+'%5D,%22release_year_from%22:null,%22release_year_until%22:null,%22scoring_filter_types%22:null,%22timeline_type%22:null%7D';
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var results = response.items;
          //pick random movie
          var item = results[Math.floor(Math.random()*results.length)];
          
          app.playRandomLink(item.id);
        }
      } else {
        //console.log(request.readyState);
      }
    };
    request.open('GET', cors+url);
    request.send();
  }
};

  app.playRandomLink = function(id) {
    var url = 'https://apis.justwatch.com/content/titles/movie/{id}/locale/en_US';
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var data = response;
          
          for (var i = 0; i < data.offers.length; i++) {
            var offer = data.offers[i];

            if (offer.monetization_type == 'flatrate' && offer.presentation_type == 'hd') {
              var watch_url_init = offer.urls.standard_web;
              //console.log(watch_url_init + ' ' +offer.provider_id);
              //should be using provider id
              if (offer.provider_id == '8') {
                var watch_url = watch_url_init.replace("title","watch");
                //console.log(watch_url);
                window.open(watch_url,"_self");
                break;
              }
              else if (offer.provider_id == '31') {
                var watch_url = watch_url_init + '?autoplay=true';
                //console.log(watch_url);
                window.open(watch_url,"_self");
                break;
              }
              else if (offer.provider_id == '9') {
                var watch_url = watch_url_init.substring(0, watch_url_init.indexOf('?')) + '/ref=atv_dp_pb_core?autoplay=1&t=3';
                //console.log(watch_url);
                window.open(watch_url,"_self");
                break;
              }
              else if (offer.provider_id == '37') {
                var watch_url = watch_url_init.replace("showtime","showtimeanytime").replace('#\/movie','#play');
                //console.log(watch_url);
                window.open(watch_url,"_self");
                break;
              }
            }
          }


        }
      } else {
        //nothing for now
      }
    };
    request.open('GET', cors+url.replace("{id}",id));
    request.send();
  }

  var initialMovieCard = {
    id: '2459115',
    original_title: 'My Movie Placeholder',
    poster: '/poster/44121984/{profile}'
  };

  app.getMovies();

})();
