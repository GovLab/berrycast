/*jshint browser: true */
/*globals $*/
$(document).ready(function () {
  "use strict";

  var countdownInterval = 500,
      googleKey = '1t-ESBjG3a9_GcbESfs02S_5od45JSN5SBApW86T-TT4',
      i = 0,
      defaultDelay = 15,
      $body = $('body'),
      $countdown = $('#countdown'),
      $slide = $('#slide'),
      $status = $('#status');

  function createIframe(url) {
     return $('<iframe />').attr({
          frameBorder: '0',
          src: url
        }).addClass('webpage').appendTo($body);
  }

  function updateIframe() {
    $status.text('Loading spreadsheet');
    $.getJSON('https://spreadsheets.google.com/feeds/list/' + googleKey +
              '/od6/public/values?alt=json-in-script&callback=?').done(function (resp) {
      var delay = defaultDelay * 1000;
      try {
        var data = resp.feed.entry,
            url,
            $iframe,
            lastUrl,
            $lastIframe;

        $lastIframe = $('.active');
        if ($lastIframe.length > 0) {
          // force reload
          lastUrl = $lastIframe.attr('src');
          $lastIframe.attr('src', 'blank.html');
          $lastIframe.attr('src', lastUrl);
        }

        $('.webpage').addClass('inactive').removeClass('active');
        i = i >= data.length - 1 ? 0 : i + 1;

        url = data[i].gsx$url.$t;
        delay = data[i].gsx$time.$t;

        delay = Number(delay);
        if (isNaN(delay)) {
          delay = defaultDelay;
        }

        $iframe = $('iframe[src="' + url + '"]');
        if ($iframe.length === 0) {
          $iframe = createIframe(url);
        }
        $iframe.addClass('active').removeClass('inactive');

        delay *= 1000;

        $countdown.text(delay);
        $slide.text(i);
        $status.text(url);
      } catch (exc) {
        $status.text(exc);
      } finally {

        var countdown = setInterval(function () {
          $countdown.text(Number($countdown.text()) - countdownInterval);
        }, countdownInterval);

        setTimeout(function () {
          clearInterval(countdown);
          updateIframe();
        }, delay);
      }
    }).fail(function () {
      var delay = defaultDelay * 1000;
      $countdown.text(delay);
      $countdown.text('failed');

      var countdown = setInterval(function () {
        $countdown.text(Number($countdown.text()) - countdownInterval);
      }, countdownInterval);

      setTimeout(function () {
        clearInterval(countdown);
        updateIframe();
      }, delay);
    });
  }

  updateIframe();
});
