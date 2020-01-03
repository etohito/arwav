define([], function() {
  // Japanese charactor code.
  var regexp = /^[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+$/;
  var Util = {
    substring: function(str, byte) {
      var ret = '';
      if (!str || !byte) {
        return ret;
      }
      var substrAt = byte;
      if (regexp.test(str.charAt(0))) {
        substrAt = byte / 1.4;
      }
      ret = str.substring(0, substrAt);

      if (substrAt < str.length - 1) {
        ret = ret + '…';
      }
      return ret;
    },
    split: function(str, byte, num) {
      if (!str || !byte) {
        return '';
      }
      var splitAt = byte;
      if (regexp.test(str.charAt(0))) {
        splitAt = byte / 1.4;
      }
      var ret = [];
      var start, end = 0;
      for (var i = 0; i < num; i++) {
        start = splitAt * i;
        end = splitAt * (i + 1);

        if (str.length < start) {
          ret.push('');
        } else {
          if (i == num - 1 && end < str.length) {
            ret.push(str.substring(start, end - splitAt / byte) + '…');
          } else {
            ret.push(str.substring(start, end));
          }
        }
      }
      return ret;
    }
  };
  return Util;
});
