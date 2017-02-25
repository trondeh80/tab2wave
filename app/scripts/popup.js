(function () {
  'use strict';
  var Comm = commConstructor;
  Comm.prototype.getPort = getPort;
  Comm.prototype.messageEvent = messageEvent;
  Comm.prototype.sendMessage = sendMessage;
  Comm.prototype.addListeners = addListeners;
  Comm.prototype.toggleRecording = toggleRecording;
  Comm.prototype.setStatus = setStatus;

  var c = new Comm();

  function commConstructor() {
    this.getPort().onMessage.addListener(this.messageEvent.bind(this));
    $(document).ready(addListeners.bind(this));

    this.sendMessage({
      action: 'tabActivated'
    })
  }

  function setStatus(args) {
    if (args.isActive) {
      showActiveRecording();
    } else {
      showStoppedRecording();
    }
  }

  function toggleRecording() {
    if (!$("#record").hasClass('recording')) {
      this.sendMessage({action: 'startRecording'});
      showActiveRecording();
    } else {
      this.sendMessage({action: 'stopCapture'});
      showStoppedRecording();
    }
  }

  function addListeners() {

    $("#record").click(toggleRecording.bind(this));
  }


  function showActiveRecording() {
    $('#record').addClass('recording');
  }

  function showStoppedRecording() {
    $('#record').removeClass('recording');
  }

  function getPort() {
    if (!this.port) {
      this.port = chrome.extension.connect({name: "communicator"});
    }
    return this.port;
  }

  function sendMessage(msg) {
    chrome.tabs.getSelected(null, function (tab) {
      msg.tabId = tab.id;
      this.getPort().postMessage(msg);
    }.bind(this));
  }

  function messageEvent(msg) {
    if (typeof this[msg['action']] === 'function') {
      this[msg['action']].call(this, msg.args);
    }
  }

})();
