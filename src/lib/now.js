'use strict';

var start = dateNow();

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
 * 这里时间是总的时间
 * requestAnimation回调的时间是window.performance.now()
 *
 * @returns {Number} 返回time in ms
 */
function nowFromStart() {
  if (window.performance) {
    // window.performance.now() 从页面打开(window.performance.timing.navigationStart)到执行到这里(dateNow)的时间
    // return window.performance.timing.navigationStart + window.performance.now();
    return window.performance.now()
  }
  
  return dateNow() - start;
};

module.exports = nowFromStart;
