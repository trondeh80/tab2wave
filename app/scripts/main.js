'use strict';

var Extension = tab2Mp3Constructor ;
Extension.prototype.messageEvent = messageEvent;
Extension.prototype.getPort = getPort;
Extension.prototype.clear = clear;

var Ext = new Extension();

function tab2Mp3Constructor(){

  this.tabs = {};

  chrome.runtime.onInstalled.addListener(function (details) {});

  // if browseraction
  if (chrome.pageAction) {

    // Activate the pageAction:
    chrome.tabs.onUpdated.addListener(function (tabId) {
      chrome.pageAction.show(tabId);
    });

    chrome.tabs.onActivated.addListener(function (tab) {
      chrome.pageAction.show(tab.tabId);
    });

    chrome.extension.onConnect.addListener(function (port) {
      this.port = port;
      this.port.onMessage.addListener(messageEvent.bind(this));
    }.bind(this));
  }
}

function getPort(){
  return this.port;
}

function clear(instance) {
  delete this.tabs[instance.tabId] ;
}

function messageEvent(msg){
  if (!this.tabs[msg.tabId]) {
    this.tabs[msg.tabId] = new TabRecorder(this, msg.tabId);
  }
  if (typeof this.tabs[msg.tabId][msg['action']] === "function") {
    this.tabs[msg.tabId][msg['action']].call(this.tabs[msg.tabId], msg.args);
  }
}
