# Phone Status Manager

This tool watches the Plantronics Savi headset base for usage and notifies services of such activities.

## Slack

When the headset is **undocked** the status will be updated to 'On a call' with a telephone emoji.
When the headset is **docked** the status will be cleared and so will the emoji.

## Using This

### Installation

- Copy `.env.example` to `.env`
- Alter any environment variables. For example, you can get your Slack Web token [here](https://api.slack.com/custom-integrations/legacy-tokens).
- Run `npm install` to get the dependencies

### Running

I suggest using forever to run the app.

`npm install forever -g`

Then, make sure Plantronics Hub is running, then run

`forever start app.js`
