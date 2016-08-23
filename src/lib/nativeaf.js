'use strict';

var raf;
var caf;

(function(win) {
  raf = win.requestAnimationFrame;
  caf = win.cancelAnimationFrame;

  var vendors = ['webkit', 'moz', 'o', 'ms'];
  var vendor;
  var i;
  
  if (!raf) {
    for(i = 0; i < vendors.length; i++) {
      vendor = win[vendors[i] + 'RequestAnimationFrame'];
      if (vendor) {
        raf = vendor;
        caf = win[vendors[i] + 'CancelAnimationFrame'];
        break;
      }
    }
  }
})(window);

module.exports.raf = raf;
module.exports.caf = caf;
