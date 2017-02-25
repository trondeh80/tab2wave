'use strict';
(function () {
  var TabRecorder = tabRecorderConstructor;
  TabRecorder.prototype.startRecording = startRecording;
  TabRecorder.prototype.activateCapture = activateCapture;
  TabRecorder.prototype.stopCapture = stopCapture;
  TabRecorder.prototype.getContext = getContext;
  TabRecorder.prototype.sendFile = sendFile;
  TabRecorder.prototype.tabActivated = tabActivated;
  TabRecorder.prototype.sendMessage = sendMessage;
  TabRecorder.prototype.startCapture = startCapture;
  TabRecorder.prototype.getAudioElement = getAudioElement;

  function tabRecorderConstructor(_extension, tabId) {
    this.isEnabled = false;
    this.extension = _extension;
    this.tabId = tabId;
  }

  function startRecording() {
    chrome.tabs.getSelected(null, function (tab) {
      this.tab = tab;
      if (!this.audioElement) {
        chrome.tabCapture.capture({
          audio: true,
          video: false
        }, activateCapture.bind(this));
      } else {
        this.startCapture();
      }
    }.bind(this));
  }

  function activateCapture(_audioElement) {
    this.audioElement = _audioElement;
    this.startCapture();
  }

  function startCapture() {
    this.isEnabled = true;
    this.source = this.getContext().createMediaStreamSource(this.getAudioElement());
    this.source.connect(this.getContext().destination);
    this.recorder = new Recorder(this.source);
    this.recorder.record();
  }

  function getAudioElement() {
    return this.audioElement;
  }

  function tabActivated() {
    this.sendMessage({
      action: 'setStatus',
      args: {
        isActive: this.isEnabled
      }
    });
  }

  function sendMessage(msg) {
    this.extension.getPort().postMessage(msg);
  }

  function stopCapture() {
    this.recorder.stop();
    this.recorder.exportWAV(sendFile.bind(this));
    this.isEnabled = false;
    this.audioElement.getAudioTracks()[0].stop();
    this.recorder.clear();
    this.extension.clear(this); // will delete the instance.
  }

  function sendFile(waveBlob) {
    Recorder.forceDownload(waveBlob, 'tab2wave.wav');
  }

  function getContext() {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }
})();
