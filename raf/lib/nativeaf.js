'use strict';

var raf = window.requestAnimationFram;
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