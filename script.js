var urls = ["http://thegovlab.org",
            "http://mobile.nytimes.com",
            "http://techcrunch.com/government-2/",
            "http://www.whitehouse.gov/"
];

var timer = 15000;
var i = 1;

var iframe = document.getElementById('iframe');
iframe.src = urls[0];
var interval = setInterval(function () {
  var iframe = document.getElementById('iframe');
  iframe.src = urls[i];
  i += 1;
  if (i > urls.length - 1) {
    i = 0;
  }
}, timer);
