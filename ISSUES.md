* Wifi dying [resolved?: modprobe.d]
* Error messages appearing on the screen -- missing profile and Flash install
  [resolved?: clear config but don't create sqlite database]
* frames being blocked (x-frame-options) [resolved?: use polipo to strip
  X-Frame-Options]
* The iframe being "escaped" by the content [resolved?: don't disable
  web-security]
* Full-sizing the Chromium window [resolved: using the script]

* Doesn't automatically update the Pis when something in this repo changes --
  could be fixed with 

    Found the answer here thanks to @jszakmeister:

    git ls-remote $URL HEAD

    For my private repo, I had to use the following syntax instead of the URL:

    git ls-remote git@github.com:ORG/PROJECT.git HEAD

* Use google sheets [resolved]
* Login via cookie
* Login via automation (selenium)
* Reload pages in background to keep them up to date
