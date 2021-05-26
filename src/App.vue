<template>
  <div id="app">
    <div class="reds">
      <video src="" v-show="!isShowImg" id="video"></video>
      <canvas
        id="outrec"
        v-show="isShowImg"
        width="600"
        height="600"
        src=""
      ></canvas>
    </div>
    <button id="rec" @click="pictureAgain">重新拍照</button>
    <button id="camera" @click="photograph">拍照</button>
  </div>
</template>

<script>
import $ from "jquery";

function isChrome() {
  var ua = navigator.userAgent.toLowerCase();

  return ua.indexOf("chrome") > 1;
}
//测试mime
function _mime(option, value) {
  var mimeTypes = navigator.mimeTypes;
  for (var mt in mimeTypes) { 
    if (mimeTypes[mt][option] == value) {
      return true;
    }
  }
  return false;
}

//检测电脑设备是否已经安装了摄像头
let realCutNums = 0;
let cutNums = 5;

console.log(navigator);
console.log(navigator.mediaDevices);
if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
  // Firefox 38+ seems having support of enumerateDevicesx
  navigator.enumerateDevices = function (callback) {
    navigator.mediaDevices.enumerateDevices().then(callback);
  };
}
let mediaStreamTrack;
var MediaDevices = [];
var isHTTPs = location.protocol === "https:";
var canEnumerate = false;

if (
  typeof MediaStreamTrack !== "undefined" &&
  "getSources" in MediaStreamTrack
) {
  canEnumerate = true;
} else if (
  navigator.mediaDevices &&
  !!navigator.mediaDevices.enumerateDevices
) {
  canEnumerate = true;
}

var hasMicrophone = false;
var hasSpeakers = false;
var hasWebcam = false;

var isMicrophoneAlreadyCaptured = false;
var isWebcamAlreadyCaptured = false;

function checkDeviceSupport(callback) {
  console.log(callback);
  console.log(canEnumerate);
  if (!canEnumerate) {
    return;
  }

  if (
    !navigator.enumerateDevices &&
    window.MediaStreamTrack &&
    window.MediaStreamTrack.getSources
  ) {
    navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(
      window.MediaStreamTrack
    );
  }

  if (!navigator.enumerateDevices && navigator.enumerateDevices) {
    navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
  }

  if (!navigator.enumerateDevices) {
    if (callback) {
      callback();
    }
    return;
  }

  MediaDevices = [];
  navigator.enumerateDevices(function (devices) {
    console.log("--------------------- ");
    console.log(devices);
    devices.forEach(function (_device) {
      var device = {};
      for (var d in _device) {
        device[d] = _device[d];
      }

      if (device.kind === "audio") {
        device.kind = "audioinput";
      }

      if (device.kind === "video") {
        device.kind = "videoinput";
      }

      var skip;
      MediaDevices.forEach(function (d) {
        if (d.id === device.id && d.kind === device.kind) {
          skip = true;
        }
      });

      if (skip) {
        return;
      }

      if (!device.deviceId) {
        device.deviceId = device.id;
      }

      if (!device.id) {
        device.id = device.deviceId;
      }

      if (!device.label) {
        device.label = "Please invoke getUserMedia once.";
        if (!isHTTPs) {
          device.label =
            "HTTPs is required to get label of this " +
            device.kind +
            " device.";
        }
      } else {
        if (device.kind === "videoinput" && !isWebcamAlreadyCaptured) {
          isWebcamAlreadyCaptured = true;
        }

        // if (device.kind === 'audioinput' && !isMicrophoneAlreadyCaptured) {
        //     isMicrophoneAlreadyCaptured = true;
        // }
      }

      if (device.kind === "audioinput") {
        hasMicrophone = true;
      }

      if (device.kind === "audioiutput") {
        hasSpeakers = true;
      }

      if (device.kind === "videoinput") {
        hasWebcam = true;
      }

      // there is no 'videoouput' in the spec.

      MediaDevices.push(device);
    });

    if (callback) {
      callback();
    }
  });
}
export default {
  name: "App",
  data() {
    return {
      isShowImg: false,
    };
  },
  methods: {
    pictureAgain() {
      console.log(121212);
      this.init();
      setTimeout(() => {
        this.isShowImg = false;
      }, 1000);
    },
    init() {
      let video = document.getElementById("video");
      checkDeviceSupport(function () {
        if (hasWebcam == false) {
          alert("没有摄像头！");
          return false;
        } else {
          var Devicestate = navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });

          Devicestate.then(function (mediaStream) {
            console.log(mediaStream);
            mediaStreamTrack = mediaStream;
            video.srcObject = mediaStream;
            video.onloadedmetadata = function (e) {
              video.play();
            };
          });

          //用户拒绝使用,或者没有摄像头
          Devicestate.catch(function (err) {
            alert("没有摄像头！");
          });
        }
      });
    },
    photograph() {
      let outrec = document.getElementById("outrec");
      let outreccon = outrec.getContext("2d");
      outreccon.drawImage(video, 0, 0, 500, 500);
      let img = outrec.toDataURL("image/jpeg", 0.5);
      $("#imgvideo").attr("src", img);
      this.isShowImg = !this.isShowImg;
      console.log(mediaStreamTrack.getTracks());
      mediaStreamTrack.getTracks()[1].stop();
    },
  },
  mounted() {
    this.init();
    window.onblur = function (e) {
      console.log(e);
      let ev = e || window.enevt;
      if (ev.stopPropagation) {
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      }
      console.log(navigator.appName);
      realCutNums += 1;
      if (
        navigator.appName == "Microsoft Internet Explorer" &&
        navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE8.0"
      ) {
        var x = e.clientX;
        var y = e.clientY;
        var w = document.body.clientWidth;
        var h = document.body.clientHeight;
        if (x >= 0 && x <= w && y >= 0 && y <= h) {
          realCutNums = 0;
          return false;
        }
      }
      if (realCutNums < cutNums) {
        let is360 = _mime("type", "application/vnd.chromium.remoting-viewer");
        if (isChrome() && is360) {
          alert(`切屏${realCutNums}次`)
        } else {
          alert(`切屏${realCutNums}次`)
          // 去掉焦点
        } 
        console.log(2344444);
      } else {
        return true;
      }
    };
  },
};
</script>

<style>
.reds {
  width: 600px;
  height: 600px;
  position: relative;
}
#video {
  width: 600px;
  height: 600px;
}
#outrec {
  width: 600px;
  height: 600px;
  position: absolute;
  top: 0;
  left: 0;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
