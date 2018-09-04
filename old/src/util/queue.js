var request = require('superagent');


if (!Date.now) {
  Date.now = function() { return new Date().getTime(); }
}



var queue = [];

function enQueue (params) {

  queue.push(params);


  // if this is the last item insertsQueue launch the process
  if (queue.length === 1) {
    doNextInsertFromQueue();
  }
}


function doNextInsertFromQueue() {
  setImmediate(_doNextInsertFromQueue);
}

function _doNextInsertFromQueue() {
  var e = queue[0];

  postBatch(e, function(error) {
    if (error) {
      console.log(error);
    }
    queue.shift(); // remove first element from insertsQueue
    // if they are remaining execution in insertsQueue process them
    if (queue.length > 0) {
      doNextInsertFromQueue();
    }

  });

}




function postBatch(params, callback)  {
  var events = params.events;
  var error = null;
  var body = [];
  events.forEach(function (event) {
    body.push({
      "method": "events.create",
      "params": event
    })
  });

  var startDate = Date.now();

  var url = 'https://' + params.username + '.' + params.domain + '/';

  request.post(url)
    .headers({'Authorization': params.auth, 'Content-Type': 'application/json'})
    .send(body)
    .end(function (response) {
      var erroneousEvents = [];
      var length = "?" ;
      if (response.body) {
        console.log('meta: ' + JSON.stringify(response.body.meta) );
        if (response.body.results) {
          length = response.body.results.length;

          // check if events all have been created
          if (events.length !== length) {
            error = '[ERROR] result size: ' + length +
              ' is diff than request size: ' + events.length;
          } else {
            for (var i = 0; i < length; i++) {
              if (! response.body.results[i].event) {
                erroneousEvents.push({index: i, event: events[i], response: response.body.results[i]})
              }
            }
          }
        } else {
          error = "[ERROR] Missing results\n" + JSON.stringify(response);
        }
      } else {
        error =  "[ERROR] Missing body\n" + JSON.stringify(response);
      }
      var deltaTime = (Date.now() - startDate) / 1000;
      console.log("[INFO]: url: " + url + "\t auth:" + params.auth);
      console.log("[INFO]: Pryv batch call: " + response.code +
        " when created " + length + " events" +
        " in " + deltaTime + " seconds");
      if (erroneousEvents.length) {
        error =  '[ERROR] on ' + erroneousEvents.length + ' events' + "\n" +
          JSON.stringify(erroneousEvents);

      }
      //console.log(JSON.stringify(response.body.results));
      callback(error);
    });

}


var events = [];

events.push({streamId: 'diary', eventType: 'mass/kg', content: 17, time: (Date.now() / 1000)})
for (var i = 0; i < 3000; i++) {
  events.push({streamId: 'diary', type: 'mass/kg', content: 17, time: (Date.now() / 1000)})
}
events.push({streamId: 'diary', type: 'mass/kg', content: 'toto', time: (Date.now() / 1000)})






enQueue({username: 'test-emfit', domain: 'pryv.io',
  auth: 'cj2r9lnrc4lvjx0yq25ssxg8j', events:events});