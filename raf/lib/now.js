'use strict';

/**
 * 返回页面打开至调用此函数的毫秒，小数10位
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
 * now
 * 默认会使用performance API 
 * 
 * @params {Object} options 如不用performance{ performance: false }
 *
 * @returns {Number} 返回time in ms
 */
function now(notusePersormance) {
  if (window.performance && surpportPerformance && !notusePersormance) {
    return window.performance.now() + window.performance.timing.navigationStart;
  }
  return dateNow();
};

module.exports = now;