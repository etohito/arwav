define([], function() {
  // Japanese charactor code.
  var regexp = /^[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+$/;
  var Util = {
    substring: function(str, byte) {
      if (!str || !byte) {
        return '';
      }
      var substrAt = byte;
      if (regexp.test(str.charAt(0))) {
        substrAt = byte / 2;
      }
      var ret = str.substring(str, substrAt);
      if (substrAt < str.length - 1) {
        ret += '…';
      }
      return ret;
    }
  };
  return Util;
});
