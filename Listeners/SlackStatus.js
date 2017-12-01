/**
 * Slack Status Changer
 * 
 * When undocked, change to undocked.  When docked, change to docked.
 */

let request = require('request'),
    util = require('util');

const eventCallStarted = 'Undocked';
const eventCallEnded = 'Docked';
const slackStatusUrl = 'https://slack.com/api/users.profile.set';
const onCallStatusMessage = 'On a call';
const onCallStatusEmoji = ':telephone_receiver:';

/**
 * Update our slack message based on the event type
 * 
 * @param {*string} type 
 */
let updateSlack = (type) => {
    request.post(slackStatusUrl, {
        form: {
            token: process.env.SLACK_TOKEN,
            profile: JSON.stringify({
                status_text: type === eventCallStarted ? onCallStatusMessage : '',
                status_emoji: type === eventCallStarted ? onCallStatusEmoji : ''
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
    eventEmitter.addListener(eventCallEnded, () => {
        updateSlack(eventCallEnded);
    });
    eventEmitter.addListener(eventCallStarted, () => {
        updateSlack(eventCallStarted);
    });
};

module.exports = register;