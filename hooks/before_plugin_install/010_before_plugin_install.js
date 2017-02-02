#!/usr/bin/env node

var _ = require('lodash');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var exec = require('child_process').exec;

function prepareAndroidYoutube () {
  var pluginPath = 'plugins/remcob00-cordova-youtube-android-player-api';
  var pluginDepPath = pluginPath + '/src/android/YouTubeAndroidPlayerApi.jar';

  function ensurePluginReady () {
    return fs.statAsync(pluginDepPath).catch(function () {
      exec('cd ' + pluginPath + ' && npm install');
    });
  }

  function checkPluginPresence () {
    return fs.statAsync(pluginPath);
  }

  return checkPluginPresence()
    .then(ensurePluginReady)
    .catchReturn();
}

Promise.resolve()
  .then(prepareAndroidYoutube);
