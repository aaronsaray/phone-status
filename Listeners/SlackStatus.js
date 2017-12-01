/**
 * Slack Status Changer
 * 
 * When undocked, change to undocked.  When docked, change to docked.
 */

const request = require('request'),
    util = require('util');

const EVENT_CALL_STARTED = 'Undocked';
const EVENT_CALL_ENDED = 'Docked';
const SLACK_STATUS_URL = 'https://slack.com/api/users.profile.set';
const ON_CALL_STATUS_MESSAGE = 'On a call';
const ON_CALL_STATUS_EMOJI = ':telephone_receiver:';
const OFF_CALL_STATUS_MESSAGE = '';
const OFF_CALL_STATUS_EMOJI = '';

/**
 * Update our slack message based on the event type
 * 
 * @param {*string} type 
 */
let updateSlack = (type) => {
    request.post(SLACK_STATUS_URL, {
        form: {
            token: process.env.SLACK_TOKEN,
            profile: JSON.stringify({
                status_text: type === EVENT_CALL_STARTED ? ON_CALL_STATUS_MESSAGE : OFF_CALL_STATUS_MESSAGE,
                status_emoji: type === EVENT_CALL_STARTED ? ON_CALL_STATUS_EMOJI : OFF_CALL_STATUS_EMOJI
            })
        }
    }, (error, response, body) => {
        if (error) {
            console.error(type, error);
            return false;
        }
    });
}

 /**
  * Registration of our events
  * @param {*EventEmitter} eventEmitter 
  */
let register = (eventEmitter) => {
    eventEmitter.addListener(EVENT_CALL_ENDED, () => {
        updateSlack(EVENT_CALL_ENDED);
    });
    eventEmitter.addListener(EVENT_CALL_STARTED, () => {
        updateSlack(EVENT_CALL_STARTED);
    });
};

module.exports = register;