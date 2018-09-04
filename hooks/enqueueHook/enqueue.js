/* jshint -W117 */

module.exports = hook = {
  id: 'enqueue',
  name: 'Enqueue-measurements',
  active: 'on', // can also be 'off', 'faulty'
  timeout: 5000, // time in ms
  maxFail: 10, // how many erroneous before put in 'faulty' mode
  on: ['eventsChanged', 'load', 'timer'],
  processes: [],
  processError: null
};

var processesJS = [
  {
    name: 'fetch-data',
    code: function () {

      rescheduleOrFetch();

      function rescheduleOrFetch() {
        var timedExecutionAt = persistentState.system.timedExecutionAt;
        var earliestExecutionAt = persistentState.user.earliestExecutionAt;
        var now = Date.now() / 1000;

        if (earliestExecutionAt && (now < earliestExecutionAt)) {
          // do nothing
          log = 'already rescheduled. timedExecutionAt = ' + timedExecutionAt + ', earliesExecutionAt = ' +
            earliestExecutionAt;
          return;
        }

        persistentState.system.timedExecutionAt = null;

        if (rateLimiter.isOverloaded()) {
          log = 'overloaded, ';

          var BASE_DELAY = 5;
          var JITTER_DELAY = 5;

          timedExecutionAt = now + BASE_DELAY + (Math.random() * JITTER_DELAY);
          log+= 'rescheduling to ' + timedExecutionAt;

          var ALLOWED_DELTA = 1;
          persistentState.system.timedExecutionAt = timedExecutionAt;
          persistentState.user.earliestExecutionAt = timedExecutionAt - ALLOWED_DELTA;
          return;
        }

        log = 'fetching events';
        batch = [
          {
            method: 'events.get',
            params: {
              limit: 1000,
              streams: [persistentState.system.INPUT_STREAM_ID],
              types: [persistentState.system.INPUT_TYPE],
              sortAscending: true,
              tags: [persistentState.system.TO_PROCESS_TAG]
            }
          }
        ];
      }
    }
  },
  {
    name: 'send-data-to-process',
    code: function () {
      log = '';
      if (processesResults['fetch-data'].error) {
        log = 'error fetching data: ' + processesResults['fetch-data'].error;
      }

      if (processesResults['fetch-data'].batchResult) {
        sendData()
      } else {
        // do nothing
      }

      function sendData() {
        var batchResponseBody = JSON.parse(processesResults['fetch-data'].batchResult.body);


        var events = batchResponseBody.results[0].events;
        var length = events.length;
        log += ', fetched ' + length + ' events';
        var jobs = [];
        for (var i=0; i<length; i++) {
          log += ', checking ' + printEvent(events[i]);

          if (duplicatesChecker.isInCache(events[i].id)) {
            log += ' - dropped because in cache';
            continue;
          }

          if (events[i].tags.indexOf(persistentState.system.FAULTY_TAG) >= 0) {
            log += ' - dropped because faulty';
            continue;
          }

          if (! rateLimiter.allocJob()) {
            log += ', rateLimiter full';
            log += ', events dropped: ' + (length - i);
            break;
          }

          duplicatesChecker.mark(events[i].id);

          log += ', pushing event with id=' + events[i].id;
          jobs.push({
            username: pryvEnv.username,
            token: pryvEnv.appAccess,
            domain: pryvEnv.domain,
            eventId: events[i].id
          })
        }

        log += ', events sent: ' + jobs.length;

        if (jobs.length > 0) {
          httpRequest = {
            ssl: false,
            host: persistentState.system.queue.hostname,
            path: persistentState.system.queue.path,
            port: persistentState.system.queue.port,
            headers: persistentState.system.queue.headers,
            method: 'POST',
            body: JSON.stringify({jobs: jobs})
          };
        }
      }


      function printEvent(e) {
        return '{id:' + e.id + ',time:' + e.time + ',tags:' + e.tags + '}';
      }
    }
  },
  {
    name: 'print-http-request-result',
    code: function () {
      if (processesResults['send-data-to-process'].httpResult) {
        const response = processesResults['send-data-to-process'].httpResult;
        const body = JSON.parse(response.body);
        log = 'http request status: ' + response.statusCode
          + '\n' + 'body: ' + response.body;
        rateLimiter.notify(body.rateLimiter.rate,
          body.rateLimiter.errors);
      }
    }
  }
];

// Handy tool to convert processes to Strings
function js2String(code) {
  var c = code + '';
  c = c.substring(c.indexOf('{') + 1, c.length - 1);
  return c;
}

processesJS.forEach(function (p) {
  hook.processes.push({name: p.name, code: js2String(p.code)});
});

if (this.processError) {
  hook.processError = js2String(processError);
}
