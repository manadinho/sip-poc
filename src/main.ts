import {
  Invitation,
  Inviter,
  InviterOptions,
  Referral,
  Registerer,
  RegistererOptions,
  Session,
  SessionState,
  UserAgent,
  UserAgentOptions,
  InvitationAcceptOptions,
} from "sip.js";

import { SessionDescriptionHandler } from "sip.js/lib/platform/web";

const callBtn = document.getElementById("call");
const numberField = document.getElementById("number");
const instaniateBtn = document.getElementById("instaniate-btn");

if(instaniateBtn) {
  instaniateBtn.addEventListener("click", instaniateUserAgent);
}

if(callBtn) {
  callBtn.addEventListener("click", initiateCall);
}

let userAgent: UserAgent;

function instaniateUserAgent() {
  const user = document.querySelector('#user');
  const password = document.querySelector('#password');

  if(user && password) {
    const userValue = (user as HTMLInputElement).value;
    const passwordValue = (password as HTMLInputElement).value;
    if(!userValue || !passwordValue) {
      alert("Please enter user and password");
      return;
    }
    /*
    * Create a user agent
    */
    const uri = UserAgent.makeURI(`sip:${userValue}@tkxel-team.vivantvoip.dev`);
    if (!uri) {
      throw new Error("Failed to create URI");
    }
    const userAgentOptions: UserAgentOptions = {
      uri,
      authorizationPassword: passwordValue,
      transportOptions: {
        wsServers: [`wss://tkxel-team.vivantvoip.dev:5065`],
      },
      sessionDescriptionHandlerFactoryOptions: {
        constraints: {
          video: false,
          audio: true,
        },
        iceCheckingTimeout: 500,
      },
    };
    userAgent = new UserAgent(userAgentOptions);

    /*
    * Setup handling for incoming INVITE requests
    */
    userAgent.delegate = {
      //old
        onInvite(invitation: Invitation): void {
          // An Invitation is a Session
          const incomingSession: Session = invitation;

          // Setup incoming session delegate
          incomingSession.delegate = {
            // Handle incoming REFER request.
            onRefer(referral: Referral): void {
              // ...
            },
          };

          // Handle incoming session state changes.
          incomingSession.stateChange.addListener((newState: SessionState) => {
            switch (newState) {
              case SessionState.Establishing:
                // Session is establishing.
                break;
              case SessionState.Established:
                getMediaStream(incomingSession);
                
                break;
              case SessionState.Terminated:
                // Session has terminated.
                break;
              default:
                break;
            }
          });

          // Handle incoming INVITE request.
          let constrainsDefault: MediaStreamConstraints = {
            audio: true,
            video: false,
          };

          const options: InvitationAcceptOptions = {
            sessionDescriptionHandlerOptions: {
              constraints: constrainsDefault,
            },
          };

          if(confirm("Incoming call")) {
            invitation.accept(options);
          } else{
            invitation.reject();
          }
        },
    };

    /*
    * Create a Registerer to register user agent
    */
    const registererOptions: RegistererOptions = {
      /* ... */
    };
    const registerer = new Registerer(userAgent, registererOptions);

    /*
    * Start the user agent
    */
    userAgent.start().then(() => {
      // Register the user agent
      registerer.register();

      // Send an outgoing INVITE request
      
    });

  }

}

function getMediaStream(session: any) {
  const remoteStream = new MediaStream();
  const sessionDescriptionHandler =
  session.sessionDescriptionHandler as SessionDescriptionHandler;
  sessionDescriptionHandler.peerConnection?.getReceivers().forEach((receiver) => {
    if (receiver.track) {
      remoteStream.addTrack(receiver.track);
    }
  });

  const audioElement = new Audio();
  audioElement.srcObject = remoteStream;
  audioElement.play();
}

function initiateCall() {
  if(!numberField) {
    alert("Please enter number");
    return
  }

  const number = (numberField as HTMLInputElement).value;
  if(!number) {
    alert("Please enter number");
    return
  }

  const target = UserAgent.makeURI(`sip:${number}@tkxel-team.vivantvoip.dev`);
  if (!target) {
    throw new Error("Failed to create target URI.");
  }

  // Create a new Inviter
  const inviterOptions: InviterOptions = {
    /* ... */
  };
  const inviter = new Inviter(userAgent, target);

  // An Inviter is a Session
  const outgoingSession: Session = inviter;

  // not set in pbx systen
  // Setup outgoing session delegate
  // outgoingSession.delegate = {
  //   // Handle incoming REFER request.
  //   onRefer(referral: Referral): void {
  //     // ...
  //   },
  // };

  // Handle outgoing session state changes.
  outgoingSession.stateChange.addListener((newState: SessionState) => {
    switch (newState) {
      case SessionState.Establishing:
        console.log('out going establishing')
        // Session is establishing.
        break;
      case SessionState.Established:
        console.log('out going established')
        // Session has been established.
        break;
      case SessionState.Terminated:
        console.log('out going terminated')
        // Session has terminated.
        break;
      default:
        break;
    }
  });

  // Send the INVITE request
  inviter
    .invite()
    .then(() => {
      console.log("INVITE sent");
    })
    .catch((error: Error) => {
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
