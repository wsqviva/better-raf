(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["raf"] = factory();
	else
		root["raf"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	// Thanks To
	// --------------------------------------------
	// https://github.com/chrisdickinson/raf
	// https://github.com/kof/animation-frame
	// 
	// TODO:
	// ios6 problem
	// compatible for PC
	// error handle
	'use strict';
	
	var nativeAF = __webpack_require__(1);
	var now = __webpack_require__(2);
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
	  this._isCustomFrameRate = this.frameRate !== AnimationFrame.FRAME_RATE;
	  this._lastTickTime = 0;
	  this._tickCount = 0;
	  this._currentKeymaps = {};
	  this.keymapsSize = 0;
	  this._delaying = false;
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
	  if (delay < 0) {
	    delay = 0;
	  }
	  // should be (time + delay), 但实际上会这个值大
	  // 比如10帧，应该是100ms调用，但是可能112ms调用，那么下次delay 88ms就希望调用
	  this._lastTickTime = time + delay;
	
	  // TODO:
	  if (!this.options.useNative) {
	    requestTimeout.call(this, delay);
	    return;
	  }
	
	  if (delay === 0) {
	    doCallback.call(this);
	  } else {
	    if (this.keymapsSize !== 0) {
	      nativeRAF(delayCallback.bind(this));
	    }
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
	  var realCallTime;
	  var id;
	  var item;
	
	  this._delaying = false;
	  currentKeymaps = this._currentKeymaps;
	  this._currentKeymaps = {};
	  this.keymapsSize = 0;
	  this._lastTickTime = 0;
	
	  realCallTime = window.performance.now();
	  for (id in currentKeymaps) {
	    item = currentKeymaps[id];
	    if (!item.cancelled) {
	      item.callback(realCallTime);
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
	  if (!this._isCustomFrameRate) {
	    return nativeRAF(callback);
	  }
	
	  if (typeof callback !== 'function') throw new TypeError('arguments should be a callback function');
	
	  var self = this;
	
	  this._tickCount++;
	  if (!this._delaying) {
	    this._delaying = true;
	    if (this.options.useNative) {
	      nativeRAF(delayCallback.bind(this));
	    } else {
	      setTimeout(function() {
	        delayCallback.call(self);
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
	 *
	 * @param id
	 * @returns
	 */
	AnimationFrame.prototype.cancelAnimationFrame = function(id) {
	  if (!this._isCustomFrameRate) {
	    nativeCAF(id);
	  }
	  delete this._currentKeymaps[id];
	  --this.keymapsSize;
	};
	
	
	var raf = new AnimationFrame({
	  frameRate: 10,
	  useNative: false
	});
	
	
	module.exports = AnimationFrame;

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	var raf = window.requestAnimationFrame;
	var caf = window.cancelAnimationFrame;
	var vendors = ['webkit', 'moz', 'o', 'ms'];
	var vendor;
	var i;
	
	if (!raf) {
	
	  //vendorName = _.find(vendors, function(vendor) {
	  //  return typeof window[vendor + 'RequestAnimationFrame'] == 'function';
	  //});
	
	  for(i = 0; i < vendors.length; i++) {
	    vendor = window[vendors[i] + 'RequestAnimationFrame'];
	    if (vendor) {
	      raf = vendor;
	      caf = window[vendors[i] + 'CancelAnimationFrame'];
	      break;
	    }
	  }
	}
	
	module.exports.raf = raf;
	module.exports.caf = caf;


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * 是否支持window.performance
	 *
	 * @returns {undefined | Object} 
	 */
	function surpportPerformance() {
	  return window.performance;
	};
	
	/**
	 * 返回1970.1.1至调用此函数的毫秒
	 *
	 * @returns {Number} 返回time in ms
	 */
	function dateNow() {
	  return Date.now() || new Date().getTime();
	};
	
	/**
	 * now默认会使用performance API 
	 * 
	 * @params {Object} options 如不用performance{ performance: false }
	 *
	 * @returns {Number} 返回time in ms
	 */
	function now(notusePersormance) {
	  if (window.performance && surpportPerformance && !notusePersormance) {
	    // 页面打开到执行到这里的时间，精度较高
	    return window.performance.now() + window.performance.timing.navigationStart;
	  }
	  return dateNow();
	};
	
	module.exports = now;


/***/ }
/******/ ])
});
;
//# sourceMappingURL=raf.js.map