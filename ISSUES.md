* Wifi dying [resolved?: modprobe.d]
* Error messages appearing on the screen -- missing profile and Flash install
  [resolved?: clear config but don't create sqlite database]
* frames being blocked (x-frame-options) [resolved?: use polipo to strip
  X-Frame-Options]
* The iframe being "escaped" by the content [resolved?: don't disable
  web-security]
* Full-sizing the Chromium window [resolved: using the script]

* Doesn't automatically update the Pis when something in this repo changes
  [resolved]
* Use google sheets [resolved]
* Login via cookie [resolved]
* Login via automation (selenium) [cannot be resolved, no ARM build of
  Selenium]
* Reload pages in background to keep them up to date [resolved]
* Power-save: turn screen off and back on [resolved]
  - turn off: `tvservice -o`
  - turn back on: `tvservice --preferred > /dev/null; pkill -HUP chromium`
    (startx auto-revives chromium)
