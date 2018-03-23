/**
 * The main app launcher
 */

const requestPromise = require('request-promise'),
    events = require('events'),
    util = require('util'),
    fs = require('fs');

require('dotenv').config();

/**
 * Configurations
 */
const POLL_MS = 500;
const SESION_REFERSH_MS = 3600000; // 1 hour
const SESSION_URL = 'http://localhost:32017/Spokes/DeviceServices/Attach?uid=999';
const eventURLPattern = 'http://localhost:32017/Spokes/DeviceServices/Events?sess=%s&queue=0';


/** Initialize Event and Listeners */
let eventEmitter = new events.EventEmitter();
const listenersFolderDirectory = './Listeners/';

fs.readdirSync(listenersFolderDirectory).forEach(file => {
    let register = require(listenersFolderDirectory + file);
    register(eventEmitter);
});

/**
 * Returns a promise'd result of the URL for the new session
 */
const getSessionUrl = () => {
    return requestPromise(SESSION_URL)
        .then(body => {
            let resp = JSON.parse(body);
            let sessionID = resp.Result;
            return util.format(eventURLPattern, sessionID);
        });
}

/**
 * Takes all of our events that the base issues and emits them for listeners
 * @param {string} eventsUrl 
 */
const emitEventsFromSession = (eventsUrl) => {
    return requestPromise(eventsUrl)
        .then(body => {
            return JSON.parse(body);
        })
        .then(response => {
            if (response.Result !== '') {
                if (response.Result instanceof Array) {
                    response.Result.forEach(result => {
                        eventEmitter.emit(result.Event_Name);
                    });
                }
                else {
                    // to be handled by our failure (then)
                    return response;
                }
            }
        });
}

/**
 * The main promise-based interval.  Basically the interval happens. If the interval has a problem,
 * it will resolve or reject the promise.
 * @param {string} eventsUrl 
 */
const runTask = (eventsUrl) => {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            emitEventsFromSession(eventsUrl)
                .then((resp) => {
                    // if no resp, that means nothing happened or it was handled properly
                    if (resp) {
                        clearInterval(interval);

                        const knownErrors = [
                            'Invalid session id', // expired
                            'There are no supported devices' // usb went to sleep
                        ];

                        if (resp.isError && knownErrors.includes(resp.Err.Description)) {
                            resolve(); // it's weird that it's resolving but it's telling it to move on to call main again
                        }
                        else {
                            // an unknown error, so console.error it in the catch
                            reject(resp);
                        }
                    }
                });
        }, 500);
    })
};

/**
 * Main app.  Gets the session, then runs the interval, and if its resolved, runs self again because we need to restart
 * the whole process.
 */
const main = _ => {
    getSessionUrl()
    .then(runTask)
    .then(main)
    .catch(error => {
        console.error(error);
    })
}

main();