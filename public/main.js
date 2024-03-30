"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sip_js_1 = require("sip.js");
var userAgent;
var instaniateBtn = document.getElementById("instaniate-btn");
if (instaniateBtn) {
    instaniateBtn.addEventListener("click", instaniateUserAgent);
}
function instaniateUserAgent() {
    var user = document.querySelector('#user');
    var password = document.querySelector('#password');
    if (user && password) {
        var userValue = user.value;
        var passwordValue = password.value;
        if (!userValue || !passwordValue) {
            alert("Please enter user and password");
            return;
        }
        /*
        * Create a user agent
        */
        var uri = sip_js_1.UserAgent.makeURI("sip:".concat(userValue, "@tkxel-team.vivantvoip.dev"));
        if (!uri) {
            throw new Error("Failed to create URI");
        }
        var userAgentOptions = {
            uri: uri,
            authorizationPassword: passwordValue,
            transportOptions: {
                wsServers: ["wss://tkxel-team.vivantvoip.dev:5065"],
            },
            sessionDescriptionHandlerFactoryOptions: {
                constraints: {
                    video: false,
                    audio: true,
                },
                iceCheckingTimeout: 500,
            },
        };
        userAgent = new sip_js_1.UserAgent(userAgentOptions);
        /*
        * Setup handling for incoming INVITE requests
        */
        userAgent.delegate = {
            //old
            onInvite: function (invitation) {
                // An Invitation is a Session
                var incomingSession = invitation;
                // Setup incoming session delegate
                incomingSession.delegate = {
                    // Handle incoming REFER request.
                    onRefer: function (referral) {
                        // ...
                    },
                };
                // Handle incoming session state changes.
                incomingSession.stateChange.addListener(function (newState) {
                    var _a;
                    switch (newState) {
                        case sip_js_1.SessionState.Establishing:
                            // Session is establishing.
                            break;
                        case sip_js_1.SessionState.Established:
                            var remoteStream_1 = new MediaStream();
                            var sessionDescriptionHandler = incomingSession.sessionDescriptionHandler;
                            (_a = sessionDescriptionHandler.peerConnection) === null || _a === void 0 ? void 0 : _a.getReceivers().forEach(function (receiver) {
                                if (receiver.track) {
                                    remoteStream_1.addTrack(receiver.track);
                                }
                            });
                            var audioElement = new Audio();
                            audioElement.srcObject = remoteStream_1;
                            audioElement.play();
                            break;
                        case sip_js_1.SessionState.Terminated:
                            // Session has terminated.
                            break;
                        default:
                            break;
                    }
                });
                // Handle incoming INVITE request.
                var constrainsDefault = {
                    audio: true,
                    video: false,
                };
                var options = {
                    sessionDescriptionHandlerOptions: {
                        constraints: constrainsDefault,
                    },
                };
                if (confirm("Incoming call")) {
                    invitation.accept(options);
                }
                else {
                    invitation.reject();
                }
            },
            //custom
            // onInvite: (invitation: Invitation) => {
            //   if(confirm("Incoming call")) {
            //     invitation.accept();
            //   } else{
            //     invitation.reject();
            //   }
            // },
        };
        /*
        * Create a Registerer to register user agent
        */
        var registererOptions = {
        /* ... */
        };
        var registerer_1 = new sip_js_1.Registerer(userAgent, registererOptions);
        /*
        * Start the user agent
        */
        userAgent.start().then(function () {
            // Register the user agent
            registerer_1.register();
            // Send an outgoing INVITE request
        });
    }
}
var callBtn = document.getElementById("call");
var numberField = document.getElementById("number");
if (callBtn) {
    callBtn.addEventListener("click", initiateCall);
}
function initiateCall() {
    if (!numberField) {
        alert("Please enter number");
        return;
    }
    var number = numberField.value;
    if (!number) {
        alert("Please enter number");
        return;
    }
    var target = sip_js_1.UserAgent.makeURI("sip:".concat(number, "@tkxel-team.vivantvoip.dev"));
    if (!target) {
        throw new Error("Failed to create target URI.");
    }
    // Create a new Inviter
    var inviterOptions = {
    /* ... */
    };
    var inviter = new sip_js_1.Inviter(userAgent, target);
    // An Inviter is a Session
    var outgoingSession = inviter;
    // not set in pbx systen
    // Setup outgoing session delegate
    // outgoingSession.delegate = {
    //   // Handle incoming REFER request.
    //   onRefer(referral: Referral): void {
    //     // ...
    //   },
    // };
    // Handle outgoing session state changes.
    outgoingSession.stateChange.addListener(function (newState) {
        switch (newState) {
            case sip_js_1.SessionState.Establishing:
                console.log('out going establishing');
                // Session is establishing.
                break;
            case sip_js_1.SessionState.Established:
                console.log('out going established');
                // Session has been established.
                break;
            case sip_js_1.SessionState.Terminated:
                console.log('out going terminated');
                // Session has terminated.
                break;
            default:
                break;
        }
    });
    // Send the INVITE request
    inviter
        .invite()
        .then(function () {
        console.log("INVITE sent");
    })
        .catch(function (error) {
        console.error("Failed to send INVITE", error);
    });
    // Send an outgoing REFER request
    // const transferTarget = UserAgent.makeURI("sip:transfer@example.com");
    // if (!transferTarget) {
    //   throw new Error("Failed to create transfer target URI.");
    // }
    // outgoingSession.refer(transferTarget, {
    //   // Example of extra headers in REFER request
    //   requestOptions: {
    //     extraHeaders: ["X-Referred-By-Someone: Username"],
    //   },
    //   requestDelegate: {
    //     onAccept(): void {
    //       // ...
    //     },
    //   },
    // });
}
