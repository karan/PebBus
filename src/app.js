/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');

// Load the data
ajax({
  url: 'http://api.pugetsound.onebusaway.org/api/where/stops-for-location.json?key=TEST&lat=47.653435&lon=-122.305641',
  type: 'json'
}, function(dataObj) {
  var data = dataObj.data.list;
  
  var menuSections = [];
  for (var i = 0; i < data.length; ++i) {
    var dataItem = data[i];
    var section = {
      items: [{
        title: dataItem.name,
        subtitle: ''+dataItem.id
      }]
    };
    menuSections.push(section);
  }
  
  var stopMenu = new UI.Menu({
    sections: menuSections
  });
  stopMenu.show();
  
  stopMenu.on('select', function(e) {
    var index = e.sectionIndex;
    var detailCard = new UI.Card();
    var itemData = data[index];
    ajax({
      url: 'http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/' + itemData.id + '.json?key=TEST',
      type: 'json'
    }, function(d) {
      var data = d.data.entry.arrivalsAndDepartures;
      detailCard.title(itemData.name);
      detailCard.subtitle(itemData.total_time);
      var body = '';
      body += '\n';
      detailCard.body(body);
      detailCard.show();
    }, function(error) {
      console.log('The inner ajax request failed: ' + JSON.stringify(error));
    });
  });
}, function(error) {
  console.log('The outer ajax request failed: ' + JSON.stringify(error));
});
