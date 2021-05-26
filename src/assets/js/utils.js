// 检测设备是否已经安装了摄像头
if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
  navigator.enumerateDevices = function (callback) {
    navigator.mediaDevices.enumerateDevices().then(callback);
  }
}

let MediaDevices = [];
let isHTTPs = location.protocol === 'https:';
let canEnumerate = false;

if (typeof MediaStreamTrack !== 'undefined' && 'getSource' in MediaStreamTrack) {
  canEnumerate = true;
} else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
  canEnumerate = true;
}

let hasMicrophone = false;
let hasSpeakers = false;
let hasWebcam = false;

let isMicrophoneAlreadyCaptured = false;
let isWebcamAlreayCaptured = false;

function checkDeviceSupport(callback) {
  if (!canEnumerate) {
    return;
  }

  if (!navigator.enumerateDevices && navigator.enumerateDevices) {
    navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
  }

  if (!navigator.enumerateDevices && navigator.enumerateDevices) {
    navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
  }
  if (!navigator.enumerateDevices) {
    if (callback) {
      callback()
    }
    return;
  }

  MediaDevices = [];
  navigator.enumerateDevices(function (devices) {
    devices.forEach((_device) => {
      let device = {};
      for (let d in _device) {
        device[d] = _device[d];
      }

      if (device.kind === 'audio') {
        device.kind = 'audioinput'
      }

      if (device.kind === 'video') {
        device.kind = 'videoinput';
      }

      let skip;
      mediaDevices.forEach(d => {
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
          device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
        }
      } else {
        if (device.kind === 'viedeoinput' && !isWebcamAlreayCaptured) {
          isWebcamAlreayCaptured = true;
        }
      }

      if (device.kind === 'audioinput') {
        hasMicrophone = true;
      }

      if (device.kind == 'audioonput') {
        hasSpeakers = true;
      }

      if (device.kind === 'videoinput') {
        hasWebcam = true;
      }
      MediaDevices.push(device);
    });
    if (callback) {
      callback();
    }
  });
}

