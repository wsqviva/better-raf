// Reference
// https://github.com/kof/animation-frame/blob/master/lib/animation-frame.js
// TODO:
// ios6 problem
// compatible for PC?
'use strict';

var nativeAF  = require('./lib/nativeaf');
var now = require('./lib/now');
var nativeRAF = nativeAF && nativeAF.raf;
var nativeCAF = nativeAF && nativeAF.caf;

// 默认帧数60
var DEFAULT_FRAMERATE = 60;

/**
 *
 * @params {Number || Object}  eg: { frameRate: 30 }
 */
function AnimationFrame(options) {
  if (!(this instanceof AnimationFrame)) {
    return new AnimationFrame(options)
  }
  // 用户定义的帧速率
  var frameRate;

  if (typeof options == 'number') {
    frameRate = options;
  } else if (options) {
    frameRate = options.frameRate;
  }

  frameRate || ( frameRate = DEFAULT_FRAMERATE );

  this.frameRate = frameRate;
  this.frameLength = 1000 / frameRate;
  this._lastTickTime = 0;
  this._tickCount = 0;
  this._callbacks = {};
  this._delaying = false;
}

function delayCallback(time) {
  var self = this;
  var lastTickTime = self.lastTickTime;
  var delay;
  var _callbacks;
  var id;

  if (!lastTickTime) {
    // 保证第一次走else
    self.lastTickTime = lastTickTime = time;
  }
  delay = self.frameLength - (time - lastTickTime);

  if (delay <= 0) {
    self.delaying = false;
    self.lastTickTime = time;

    _callbacks = self._callbacks;
    self._callbacks = {};
    for (id in _callbacks) {
      _callbacks[id] && _callbacks[id](window.performance.now());
    }
  } else {
    nativeRAF(delayCallback.bind(this));
  }
}

/**
 * 请求动画帧
 * 所谓自定义帧速度一定要比60小
 * 使用递归raf来判断是否调用回调,或者一个setTimeout搞定?
 *
 * @param callback
 * @returns {Number} 返回timer id
 */
AnimationFrame.prototype.request = function(callback) {
  if (this.frameRate == DEFAULT_FRAMERATE) {
    return nativeRAF(callback);
  }

  this._tickCount++;
  if (!this._delaying) {
    this._delaying = true;
    this._tickCount = nativeRAF(delayCallback.bind(this));
  }

  this._callbacks[this._tickCount] = callback;

  return this._tickCount;
};

/**
 * 取消动画帧
 *
 *
 * @param id
 * @returns
 */
AnimationFrame.prototype.cancel  = function(id) {
  nativeCAF(id);
  delete this._callbacks[id];
};

// 暂时不考虑非mobile的情况啦
//request = (function(callback) {
//  var self = this;
//  var lastTime = 0;
//  return function() {
//    // 实际下次调用的时间
//    var currTime = now();
//
//    var timeToCall = Math.max(0, self.frameRate - (currTime - lastTime));
//
//    // 期望下次调用的时间
//    lastTime = currTime + timeToCall;
//
//    return window.setTimeout(function() {
//      callback(lastTime);
//    }, timeToCall);
//  }
//})();
//

module.exports = AnimationFrame;
