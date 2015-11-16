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
