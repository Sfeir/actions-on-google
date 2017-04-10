// ASSISTANT STUFF
process.env.DEBUG = 'actions-on-google:*';
const Assistant = require('actions-on-google').ApiAiAssistant;

const GET_FIRST_SESSION_INTENT = 'get-first-session';
const NEXT_SESSION_OR_MORE_INFO_CONTEXT = 'next-session-more-info';
const NEXT_SESSION_INTENT = 'get-session.get-session-next';
const MORE_INFO_INTENT = 'get-session.get-session-more-info';

// FIREBASE STUFF
var firebase = require('firebase-admin');
var serviceAccount = require("./android-makers-firebase.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://android-makers-a3a88.firebaseio.com'
});

function processFirstSession(assistant) {
    console.log("processFirstSession");

    processSession(assistant, 0);
}

function processSecondToLastSession(assistant) {
    console.log("processSecondToLastSession");

    let contexts = assistant.getContexts();
    let context = contexts.filter(value => value.name === NEXT_SESSION_OR_MORE_INFO_CONTEXT)[0];
    let sessionIndex = context.parameters.sessionIndex;

    processSession(assistant, sessionIndex + 1);
}

function processSession(assistant, index) {
    var productIdRef = firebase.database().ref('/sessions/' + index);
    productIdRef.once('value').then(function(snapshot) {
        var childKey = snapshot.key;
        var childData = snapshot.val();

        assistant.setContext(NEXT_SESSION_OR_MORE_INFO_CONTEXT, 50, {
            sessionIndex: index
        });

        assistant.ask("OK! The title of the conference I found is " + snapshot.val().title
        + ". Would you like to learn more about it or hear about the next session?");
    });
}

function processMoreInformation(assistant) {
    let contexts = assistant.getContexts();
    let context = contexts.filter(value => value.name === NEXT_SESSION_OR_MORE_INFO_CONTEXT)[0];
    let index = context.parameters.sessionIndex;

    var productIdRef = firebase.database().ref('/sessions/' + index);
    productIdRef.once('value').then(function(snapshot) {
        var childKey = snapshot.key;
        var childData = snapshot.val();

        assistant.setContext(NEXT_SESSION_OR_MORE_INFO_CONTEXT, 50, {
            sessionIndex: index
        });

        assistant.tell("Right away! " + snapshot.val().description
        + ". Would you like to hear about the next session?");
    });
}

exports.agentFirebase = function(request, response) {
    console.log("start");

    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));

    let assistant = new Assistant({request, response});
    let actionMap = new Map();
    actionMap.set(GET_FIRST_SESSION_INTENT, processFirstSession);
    actionMap.set(NEXT_SESSION_INTENT, processSecondToLastSession);
    actionMap.set(MORE_INFO_INTENT, processMoreInformation);
    assistant.handleRequest(actionMap);
}