/**
 * The main app launcher
 */

const request = require('request'),
    events = require('events'),
    util = require('util');

require('dotenv').config();

/**
 * Configurations
 */
const POLL_MS = 500;
const SESSION_URL = 'http://localhost:32017/Spokes/DeviceServices/Attach?uid=999';
const eventURLPattern = 'http://localhost:32017/Spokes/DeviceServices/Events?sess=%s&queue=0';

/** Initialize Event and Listeners */
let eventEmitter = new events.EventEmitter();
const listenersFolderDirectory = './Listeners/';
const fs = require('fs');

fs.readdirSync(listenersFolderDirectory).forEach(file => {
    let register = require(listenersFolderDirectory + file);
    register(eventEmitter);
});

/**
 * Kick off the main process
 * - get a session
 * - with that session, pull on timer
 */
request(SESSION_URL, (error, response, body) => {
    if (error) {
        console.error(error);
        return false;
    }

    let resp = JSON.parse(body);
    let sessionID = resp.Result;
    let eventsUrl = util.format(eventURLPattern, sessionID);

    setInterval(() => {
        request(eventsUrl, (error, response, body) => {
            if (error) {
                console.error(error);
                return false;
            }

            let resp = JSON.parse(body);

            if (resp.Result !== '') {
                resp.Result.forEach(result => {
                    eventEmitter.emit(result.Event_Name);
                });
            }
        }); 
    }, 500);
});
