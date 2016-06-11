'use strict';

var TabRecorder = tabRecorderConstructor;
TabRecorder.prototype.startRecording = startRecording ;
TabRecorder.prototype.activateCapture = activateCapture ;
TabRecorder.prototype.stopCapture = stopCapture ;
TabRecorder.prototype.getContext = getContext;
TabRecorder.prototype.sendFile = sendFile;
TabRecorder.prototype.tabActivated = tabActivated;
TabRecorder.prototype.sendMessage = sendMessage;

function tabRecorderConstructor(_extension){
  this.isEnabled = false;
  this.extension = _extension ;
}

function startRecording(){
  chrome.tabs.getSelected(null, function (tab) {
    this.tab = tab;
    if (!this.isEnabled) {
      chrome.tabCapture.capture({
        audio: true,
        video: false
      }, activateCapture.bind(this));
    } else {
      this.stopCapture();
    }
  }.bind(this));
}

function tabActivated(){
  this.sendMessage({
    action:'setStatus',
    args:{
      isActive:this.isEnabled
    }
  }) ;
}

function sendMessage(msg){
  this.extension.getPort().postMessage(msg) ;
}

function stopCapture(){
  this.recorder.stop();
  this.recorder.exportWAV(sendFile.bind(this)) ;
  this.isEnabled = false ;
  this.audioElement.getAudioTracks()[0].stop();
  this.recorder.clear();
  this.extension.clear(this);
}

function sendFile(waveBlob){
  Recorder.forceDownload(waveBlob, 'tab2wave.wav') ;
}

function activateCapture(_audioElement){
  this.isEnabled = true ;
  this.audioElement = _audioElement;
  this.source = this.getContext().createMediaStreamSource(this.audioElement);

  this.source.connect(this.getContext().destination);

  this.recorder = new Recorder(this.source) ;
  this.recorder.record();
}


function getContext() {
  if (!this.context) {
    this.context = new AudioContext();
  }
  return this.context;
}
