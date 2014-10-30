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
  text: 'Finding nearby stops..',
  textAlign: 'center'
});


function locationSuccess(pos) {
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
    console.log(JSON.stringify(dataObj));
    var data;
    if (dataObj.data.stops) {
      data = dataObj.data.stops;
    } else {
      data = dataObj.data.list;
    }
  
    var stops = [];
    var limit_stops = Math.min(data.length, 5);
    for (var i = 0; i < limit_stops; ++i) {
      var dataItem = data[i];
      console.log(dataItem.name);
      var stop_names = dataItem.name.split(' & ');
      if (stop_names.length != 2) {
        stop_names = [dataItem.name.split(0, 12), dataItem.name.split(12)];
      }
      var item = {
        title: stop_names[0],
        subtitle: stop_names[1],
        stop: {
          id: dataItem.id,
          dir: dataItem.direction,
          code: dataItem.code
        }
      };
      stops.push(item);
    }
    
    var stopMenu = new UI.Menu({
      sections: [{
        title: 'Nearby stops',
        items: stops
      }]
    });

    stopMenu.on('select', function(e) {
      var stop_id = e.item.stop.id;
      var busTimes = [];
      
      info_text.text('Getting bus times');

      ajax({
        url: 'http://api.pugetsound.onebusaway.org/api/where/arrivals-and-' +
             'departures-for-stop/' + stop_id + '.json?key=TEST',
        type: 'json'
      }, function(d) {
        var data;
        if (d.data.entry) {
          data = d.data.entry.arrivalsAndDepartures;
        } else {
          data = d.data.arrivalsAndDepartures;
        }

        for (var i = 0; i < data.length; ++i) {
          var dataItem = data[i];
          console.log(dataItem.routeShortName);
          var predictTime;
          if (dataItem.predictedArrivalTime === 0) {
            predictTime = (new Date()).getTime();
          } else {
            predictTime = dataItem.predictedArrivalTime;
          }
          var item = {
            title: dataItem.routeShortName + ' ' + e.item.stop.dir,
            subtitle: Math.ceil((predictTime - d.currentTime) / (60 * 1000)) + ' mins'
          };
          busTimes.push(item);
        }
        
        var busMenu = new UI.Menu({
          sections: [{
            title: 'Upcoming Buses',
            items: busTimes
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
    
    stopMenu.show();
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