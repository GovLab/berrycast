/*jshint browser: true */
/*globals $*/
$(document).ready(function () {
  "use strict";

  var countdownInterval = 500,
      i = 0,
      defaultDelay = 15,
      $body = $('body'),
      $countdown = $('#countdown'),
      $slide = $('#slide');

  function createIframe(url) {
     return $('<iframe />').attr({
          frameBorder: '0',
          src: url
        }).addClass('webpage').css({
          zIndex: 2
        })/*.load(function () {
          window.console.log('loaded');
        })*/.appendTo($body);
  }

  function updateIframe() {
    $.getJSON('data/urls.json?_=' + (new Date()).getTime()).done(function(urls) {
      var url,
          delay,
          $iframe;

      $('.webpage').each(function (idx, el) {
        $(el).css('zIndex', 0);
      });
      i = i >= urls.length - 1 ? 0 : i + 1;

      if ($.isArray(urls[i])) {
        url = urls[i][0];
        delay = urls[i][1];
      } else {
        url = urls[i];
        delay = defaultDelay;
      }

      $iframe = $('iframe[src="' + url + '"]');
      if ($iframe.length > 0) {
        $iframe.css('zIndex', 2);
      } else {
        $iframe = createIframe(url);
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
