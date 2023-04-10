const socket = io("/");
const videoGrid = document.getElementById("video-grid");

/* ----- RECORDING SECTION ---- */
// const startRec = document.querySelector(".start");
// const stopRec = document.querySelector(".stop");

// var data = [];

// // startRec.addEventListener("click", () => {
// var recording = navigator.mediaDevices
//   .getDisplayMedia({
//     video: {
//       mediaSource: "screen",
//     },
//     audio: true,
//   })
//   .then(async (e) => {
//     // For recording the mic audio
//     let audio = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: false,
//     });

//     // Assign the recorded mediaStream to the src object
//     videoGrid.srcObject = e;

//     // Combine both video/audio stream with MediaStream object
//     let combine = new MediaStream([...e.getTracks(), ...audio.getTracks()]);
//     console.log(combine, "111");

//     /* Record the captured mediaStream
//    with MediaRecorder constructor */
//     let recorder = new MediaRecorder(combine);

//     console.log(recorder, "RCE");

//     recorder.start();

//     alert("recording started");
//     startRec.addEventListener("click", (e) => {
//       console.log("START");
//       // Starts the recording when clicked

//       // For a fresh start
//       data = [];
//     });

//     stopRec.addEventListener("click", (e) => {
//       console.log("STOP");

//       // Stops the recording
//       recorder.stop();
//       // recorder.stop();
//       alert("recording stopped");
//     });

//     /* Push the recorded data to data array
//           when data available */

//     recorder.ondataavailable = (e) => {
//       data.push(e.data);
//     };

//     recorder.onstop = () => {
//       console.log("stopping...");
//       /* Convert the recorded audio to
//                blob type mp4 media */
//       let blobData = new Blob(data, { type: "video/mp4" });

//       // Convert the blob data to a url
//       let url = URL.createObjectURL(blobData);
//       console.log(url, "URL");

//       // Assign the url to the output video tag and anchor
//       // output.src = url
//       // anc.href = url
//     };
//   });
// // });

const myVideo = document.createElement("video");
myVideo.muted = true;

var myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

let myVideoStream;

const peer = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then((stream) => {
    myVideoStream = stream;

    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream); // Answer The User's call
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      }); // Here Add Video Stream from the user
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    socket.on("createMessage", (message, userId) => {
      // console.log(message, "[]");
      $(".messages").append(
        `<li class="message"><b>User</b><br/>${message}</li>`
      );
    });
  });

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = myPeer.call(userId, stream); // For calling new user here we pass My Stream
  const video = document.createElement("video"); // Create new video Element for new user

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream); // it will add the video stream of different users
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
};

let text = $("input");
// console.log(text, "TEXT");

$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    let data = {
      msg : text.val(),
      createdAt : new Date().toLocaleTimeString()
    }
//     var now = new Date().toLocaleTimeString();
// console.log(now,"NOW")
    console.log(data );
    socket.emit("message", data);
    text.val("");
  }
});
