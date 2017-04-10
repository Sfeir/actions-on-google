process.env.DEBUG = 'actions-on-google:*';
const Assistant = require('actions-on-google').ApiAiAssistant;

const YOUR_INTENT = 'ACTION_ID_DEFINED_ON_APIAI';

const FIRST_ARGUMENT = 'first_argument';
const SECOND_ARGUMENT = 'second_argument';

function processX(assistant) {
    console.log("X");

    const arg1 = assistant.getArgument(FIRST_ARGUMENT).toLowerCase();

    switch (arg1) {
        case "string":
            assistant.tell('Something');
            break;
        default:
            assistant.tell('Sorry, I can\'t process your request right now.');
    }
}

exports.agent = function(request, response) {
    console.log("start");

    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));

    let assistant = new Assistant({request, response});
    let actionMap = new Map();
    actionMap.set(YOUR_INTENT, processX);
    assistant.handleRequest(actionMap);
}