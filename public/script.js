document.addEventListener("DOMContentLoaded", function () {
  // var socket = new JsSIP.WebSocketInterface('wss://b.vivantcorp.com:5065');
  var socket = new JsSIP.WebSocketInterface(
    "wss://tkxel-team.vivantvoip.dev:5065"
  );
  // var socket = new JsSIP.WebSocketInterface('wss://localhost:5060');
  var configuration = {
    sockets: [socket],
    // uri      : 'sip:your_username@your_sip_server',
    // uri      : 'sip:102_webrtc@tkxel-team.vivantvoip.dev',
    // password : '55wi4Vy7VQ7OGVczmp1hGGSAIikYD8pw',
    // uri      : 'sip:2931_webrtc@b.vivantcorp.com',
    // password : '6C9scDzfFrolbDpuZNve3UTav8ysTtc5'

    // bcorp live server
    // uri      : 'sip:m39P0zLx@b.vivantcorp.com',
    // password : 'Ynkwe5rYIyvWyDh1U51CfJtqvPo2Ex'

    uri: "sip:103_webrtc@tkxel-team.vivantvoip.dev",
    password: "6RJ5EnpuIoyVKfoYsiDk88U9DB83tobe",
  };

  var ua = new JsSIP.UA(configuration);

  ua.start();

  // Function to send OPTIONS request
  function sendOptionsRequest() {
    console.log("Sending OPTIONS request");
    if (ua.isConnected()) {
      ua.sendMessage("sip:103_webrtc@tkxel-team.vivantvoip.dev", "Keep alive");
    }
  }

  // Set interval for sending OPTIONS request
  var optionsRequestInterval = 60000; // 60 seconds - adjust as needed
  setInterval(sendOptionsRequest, optionsRequestInterval);

  document.getElementById("call").addEventListener("click", function () {
    var target = document.getElementById("target").value;
    if (target) {
      var options = {
        mediaConstraints: { audio: true, video: false },
      };
      var session = ua.call(target, options);

      // Add event listeners to the session
      session.on("progress", function (e) {
        console.log("call is in progress");
      });
      session.on("failed", function (e) {
        console.log("call failed with cause: " + e.cause);
      });
      session.on("ended", function (e) {
        console.log("call ended with cause: " + e.cause);
      });
      session.on("confirmed", function (e) {
        console.log("call confirmed");
      });
    }
  });
});
