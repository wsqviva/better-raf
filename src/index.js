// TODO:
// error handle
'use strict';

// 如果用户不使用false, useNative根据支不支持raf情况自动判断
var nativeAF = require('./lib/nativeaf');
var nowFromStart = require('./lib/now');
var nativeRAF = nativeAF && nativeAF.raf;
var nativeCAF = nativeAF && nativeAF.caf;

// 默认帧速率 60fps
AnimationFrame.DEFAULT_FRAMERATE = 60;

/**
 * 
 * @params {Number || Object}  eg: { frameRate: 30 }
 * @constructor
 */
function AnimationFrame(options) {
  if (!(this instanceof AnimationFrame)) {
    return new AnimationFrame(options);
  }

  // 用户自定义的帧速率
  if (typeof options == 'number') {
    options = {
      frameRate: options
    };
  }
  options || (options = {});
  options.useNative !== false && (options.useNative = true);

  this.options = options;
  // 帧速率
  this.frameRate = options.frameRate || AnimationFrame.DEFAULT_FRAMERATE;

  // 每帧时长
  this.frameLength = 1000 / this.frameRate;

  this._isCustomFrameRate = this.frameRate !== AnimationFrame.DEFAULT_FRAMERATE;
  
  this._lastTickTime = 0;
  this._tickCount = 0;
  
  this._currentKeymaps = {};
  this.keymapsSize = 0;
  
  this._delaying = false;
  
  this.boundDelayCallback = delayCallback.bind(this);
}

function delayCallback(time) {
  var lastTickTime = this._lastTickTime;
  var delay;
  time = time || 0;

  // 保证第一次走到这里
  if (lastTickTime === 0) {
    this._lastTickTime = lastTickTime = time;
  }

  delay = this.frameLength - (time - lastTickTime);
  if (delay <= 0) {
    // should be (time + delay), 但实际上会这个值大
    // 比如10帧，应该是100ms调用，但是可能112ms调用，那么下次delay 88ms就希望调用
    this._lastTickTime = time + delay;
    delay = 0;
  }
  
  if (!this.options.useNative) {
    requestTimeout.call(this, delay);
    return;
  }

  if (delay === 0) {
    doCallback.call(this);
  } else {
    // if (this.keymapsSize !== 0) {
      nativeRAF(this.boundDelayCallback);
    // }
  }
}

// use timeout
function requestTimeout(delay) {
  var self = this;
  setTimeout(function() {
    doCallback.call(self);
  }, delay);
};

function doCallback() {
  var currentKeymaps;
  var timeFromStart;
  var id;
  var item;

  this._delaying = false;
  currentKeymaps = this._currentKeymaps;
  this._currentKeymaps = {};
  this.keymapsSize = 0;
  // this._lastTickTime = 0; 注意这里不能重置

  timeFromStart = nowFromStart();
  for (id in currentKeymaps) {
    item = currentKeymaps[id];
    if (!item.cancelled) {
      item.callback(timeFromStart);
    }
  }
}

/**
 * 请求动画帧
 * 所谓自定义帧速率一定要比60小
 * 使用递归raf来判断是否到时调用回调,或者一个setTimeout搞定(不支持或不适用native的时候)
 *
 * @param callback
 * @returns {Number} 返回timer id
 */
AnimationFrame.prototype.requestAnimationFrame = function(callback) {
  // if (!this._isCustomFrameRate) {
  //   return nativeRAF(callback);
  // }

  if (typeof callback !== 'function') throw new TypeError('arguments should be a callback function');

  var self = this;

  this._tickCount++;
  if (!this._delaying) {
    this._delaying = true;
    if (this.options.useNative) {
      nativeRAF(this.boundDelayCallback);
    } else {
      setTimeout(function() {
        self.boundDelayCallback();
      }, 0);
    }
  }

  this._currentKeymaps[this._tickCount] = {
    id: this._tickCount,
    callback: callback,
    cancelled: false
  };
  ++this.keymapsSize;

  return this._tickCount;
};

/**
 * 取消动画帧
 *
 * @param id
 * @returns
 */
AnimationFrame.prototype.cancelAnimationFrame = function(id) {
  if (!this._isCustomFrameRate) {
    nativeCAF(id);
  }
  //this._currentKeymaps[id].cancelled = true;
  delete this._currentKeymaps[id];
  --this.keymapsSize;
};

module.exports = AnimationFrame;