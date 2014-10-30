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
          stop_id: dataItem.id
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

    stopMenu.on('select', function(e) {
      var stop_id = e.item.stop_id;
      var busTimesSections = [];

      ajax({
        url: 'http://api.pugetsound.onebusaway.org/api/where/arrivals-and-' +
             'departures-for-stop/' + stop_id + '.json?key=TEST',
        type: 'json'
      }, function(d) {
        var data = d.data.arrivalsAndDepartures;
        for (var i = 0; i < data.length; ++i) {
          var dataItem = data[i];
          console.log(dataItem.routeShortName);
          var section = {
            items: [{
              title: dataItem.routeShortName + dataItem.tripHeadsign,
              subtitle: dataItem.predictedArrivalTime
            }]
          };
          busTimesSections.push(section);
        }
        
        var busMenu = new UI.Menu({
          sections: [{
            title: 'Upcoming Buses',
            items: busTimesSections
          }]
        });
        busMenu.show();
      }, function(error) {
        if (error.message) {
          info_text.text(error.message);
        } else {
          info_text.text('Connection Error');
        }
      });
    });
  }, function(error) {
    if (error.message) {
      info_text.text(error.message);
    } else {
      info_text.text('Connection Error');
    }
  });
}


function init() {
  console.log('Initing');
  window.navigator.geolocation.getCurrentPosition(locationSuccess,
                                                  locationError,
                                                  locationOptions);
}

main_window.add(info_text);
main_window.show();
init();