/*jshint browser: true */
/*globals $*/
$(document).ready(function () {
  "use strict";

  var iframes = [],
      countdownInterval = 500,
      i = -1,
      defaultDelay = 15,
      $body = $('body'),
      $countdown = $('#countdown'),
      $slide = $('#slide');

  function createIframe(url) {
     return $('<iframe />').attr({
          frameBorder: '0',
          src: url
        }).css({
          zIndex: 2
        })/*.load(function () {
          window.console.log('loaded');
        })*/.appendTo($body);
  }

  function updateIframe() {
    $.getJSON('data/urls.json').done(function(urls) {
      var url,
          delay;

      if (iframes[i]) {
        iframes[i].css('zIndex', 0);
      }
      i = i > urls.length - 2 ? 0 : i + 1;

      if ($.isArray(urls[i])) {
        url = urls[i][0];
        delay = urls[i][1];
      } else {
        url = urls[i];
        delay = defaultDelay;
      }
      if (iframes[i]) {
        iframes[i].css('zIndex', 2);
      } else {
        iframes[i] = createIframe(url);
      }

      delay *= 1000;

      $countdown.text(delay);
      $slide.text(i);

      var countdown = setInterval(function () {
        $countdown.text(Number($countdown.text()) - countdownInterval);
      }, countdownInterval);

      setTimeout(function () {
        clearInterval(countdown);
        updateIframe();
      }, delay);
    }).fail(function () {
      setTimeout(updateIframe, defaultDelay * 1000);
    });
  }

  updateIframe();
});
