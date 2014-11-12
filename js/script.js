/*jshint browser: true*/
/*globals $*/
$(document).ready(function () {
  "use strict";

  var iframes = [],
      i = -1,
      delay = 100,
      $body = $('body');

  function updateIframe() {
    $.getJSON('data/urls.json').done(function(urls) {
      if (iframes[i]) {
        iframes[i].css({
          zIndex: 0
        });
      }
      i = i > urls.length - 2 ? 0 : i + 1;
      if (iframes[i]) {
        iframes[i].css({
          zIndex: 2
        });
      } else {
        iframes[i] = $('<iframe />').attr({
          frameBorder: '0',
          src: urls[i]
        }).css({
          zIndex: 2
        }).load(function () {
          window.console.log('loaded');
        }).appendTo($body);
      }
    });
  }

  updateIframe();

  setInterval(updateIframe, delay);

  /*
  var timer = 30000;
  var i = 1;
  iframe.src = urls[0];
  var interval = setInterval(function () {
    var iframe = document.getElementById('iframe');
    iframe.src = urls[i];
    i += 1;
    if (i > urls.length - 1) {
      i = 0;
    }
  }, timer);
 */
});
