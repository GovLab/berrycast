var urls = ["http://thegovlab.org",
            "http://nytimes.com"
];

var timer = 10000;
var i = 0;

var interval = setInterval(function () {
  var iframe = document.getElementById('iframe');
  iframe.src = urls[i];
  i += 1;
  if (i > urls.length - 1) {
    i = 0;
  }
}, timer);
