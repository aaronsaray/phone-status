/**
 * The main app launcher
 */

let request = require('request'),
    events = require('events'),
    util = require('util');

require('dotenv').config();

/**
 * Configurations
 */
const pollMs = 500;
const sessionURL = 'http://localhost:32017/Spokes/DeviceServices/Attach?uid=999';
const eventURLPattern = 'http://localhost:32017/Spokes/DeviceServices/Events?sess=%s&queue=0';

/** Initialize Event and Listeners */
let eventEmitter = new events.EventEmitter();
const listenersFolderDirectory = './Listeners/';
const fs = require('fs');
let listeners = [];

fs.readdirSync(listenersFolderDirectory).forEach(file => {
    let register = require(listenersFolderDirectory + file);
    register(eventEmitter);
});

/**
 * Kick off the main process
 * - get a session
 * - with that session, pull on timer
 */
request(sessionURL, (error, response, body) => {
    if (error) {
        console.error(error);
        return false;
    }

    let resp = JSON.parse(body);
    let sessionID = resp.Result;

    setInterval(() => {
        request(util.format(eventURLPattern, sessionID), (error, response, body) => {
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
