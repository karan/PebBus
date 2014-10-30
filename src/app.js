// libs
var UI = require('ui');
var Vector2 = require('vector2'); 
var ajax = require('ajax');

// variables
var locationOptions = {'timeout': 15000, 'maximumAge': 30000,
                       'enableHighAccuracy': true};


var main_window = new UI.Window();
var info_text = new UI.Text({
  position: new Vector2(0, 50),
  size: new Vector2(144, 30),
  text: 'OneMoreBusAway',
  textAlign: 'center'
});


function locationSuccess(pos) {
  console.log('in locationsuccess');
  console.log(JSON.stringify(pos.coords));
  fetchStops(pos.coords);
}


function locationError(err) {
  console.warn('location error (' + err.code + '): ' + err.message);
  info_text.text('Can\'t get location.');
}


function fetchStops(coords) {
  ajax({
    url: 'http://api.pugetsound.onebusaway.org/api/where/stops-for-location.' +
         'json?key=TEST&lat=' + coords.latitude + '&lon=' + coords.longitude,
    type: 'json'
  }, function(dataObj) {
    var data = dataObj.data.list;
  
    var menuSections = [];
    var limit_stops = Math.min(data.length, 5);
    for (var i = 0; i < limit_stops; ++i) {
      var dataItem = data[i];
      console.log(dataItem.name);
      var section = {
        items: [{
          title: dataItem.name,
          subtitle: ''+dataItem.id
        }]
      };
      menuSections.push(section);
    }
    
    var stopMenu = new UI.Menu({
      sections: [{
        title: 'Nearby stops',
        items: menuSections
      }]
    });
    stopMenu.show();
  }, function(error) {
    if (error.message) {
      info_text.text(error.message);
    } else {
      info_text.text('Connection Error');
    }
  });
}

// Load the data
// ajax({
//   url: 'http://api.pugetsound.onebusaway.org/api/where/stops-for-location.json?key=TEST&lat=47.653435&lon=-122.305641',
//   type: 'json'
// }, function(dataObj) {
//   var data = dataObj.data.list;
  
//   var menuSections = [];
//   var limit_stops = Math.min(data.length, 5);
//   for (var i = 0; i < limit_stops; ++i) {
//     var dataItem = data[i];
//     var section = {
//       items: [{
//         title: dataItem.name,
//         subtitle: ''+dataItem.id
//       }]
//     };
//     menuSections.push(section);
//   }
  
//   var stopMenu = new UI.Menu({
//     sections: [{
//       title: 'Nearby stops',
//       items: menuSections
//     }]
//   });
//   stopMenu.show();
  
//   stopMenu.on('select', function(e) {
//     var index = e.sectionIndex;
//     var detailCard = new UI.Card();
//     var itemData = data[index];
//     ajax({
//       url: 'http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/' + itemData.id + '.json?key=TEST',
//       type: 'json'
//     }, function(d) {
//       var data = d.data.entry.arrivalsAndDepartures;
//       detailCard.title(itemData.name);
//       detailCard.subtitle(itemData.total_time);
//       var body = '';
//       body += '\n';
//       detailCard.body(body);
//       detailCard.show();
//     }, function(error) {
//       console.log('The inner ajax request failed: ' + JSON.stringify(error));
//     });
//   });
// }, function(error) {
//   console.log('The outer ajax request failed: ' + JSON.stringify(error));
// });

function init() {
  console.log('Initing');
  window.navigator.geolocation.getCurrentPosition(locationSuccess,
                                                  locationError,
                                                  locationOptions);
}

main_window.add(info_text);
main_window.show();
init();