# This script automates the process described at
# http://blogs.wcode.org/2013/09/howto-boot-your-raspberry-pi-into-a-fullscreen-browser-kiosk/
#
# The result should be a raspberry pi that automatically loads content from
# https://govlab.github.io/raspberry/$IP_ADDRESS_OF_MACHINE/

echo '
# 1900x1200 at 32bit depth, DMT mode
disable_overscan=1
framebuffer_width=1900
framebuffer_height=1200
framebuffer_depth=32
framebuffer_ignore_alpha=1
hdmi_pixel_encoding=1
hdmi_group=2
' >> /boot/config.txt

echo '#!/bin/sh -e

# Wait for the TV-screen to be turned on...
while ! $( tvservice --dumpedid /tmp/edid | fgrep -qv '"'"'Nothing written!'"'"' ); do
    bHadToWaitForScreen=true;
    printf "===> Screen is not connected, off or in an unknown mode, waiting for it to become available...\\n"
    sleep 10;
done;

printf "===> Screen is on, extracting preferred mode...\\n"
_DEPTH=32;
eval $( edidparser /tmp/edid | fgrep '"'"'preferred mode'"'"' | tail -1 | sed -Ene '"'"'s/^.+(DMT|CEA) \(([0-9]+)\) ([0-9]+)x([0-9]+)[pi]? @.+/_GROUP=\\1;_MODE=\\2;_XRES=\\3;_YRES=\\4;/p'"'"' );

printf "===> Resetting screen to preferred mode: %s-%d (%dx%dx%d)...\n" $_GROUP $_MODE $_XRES $_YRES $_DEPTH
tvservice --explicit="$_GROUP $_MODE"
sleep 1;

printf "===> Resetting frame-buffer to %dx%dx%d...\\n" $_XRES $_YRES $_DEPTH
fbset --all --geometry $_XRES $_YRES $_XRES $_YRES $_DEPTH -left 0 -right 0 -upper 0 -lower 0;
sleep 1;

if [ -f /boot/xinitrc ]; then
    ln -fs /boot/xinitrc /home/pi/.xinitrc;
    su - pi -c '"'"'startx'"'"' &
fi

exit 0
' > /etc/rc.local

echo '#!/bin/sh
while true; do

    # Clean up previously running apps, gracefully at first then harshly
    killall -TERM chromium 2>/dev/null;
    killall -TERM matchbox-window-manager 2>/dev/null;
    sleep 2;
    killall -9 chromium 2>/dev/null;
    killall -9 matchbox-window-manager 2>/dev/null;

    # Clean out existing profile information
    rm -rf /home/pi/.cache;
    rm -rf /home/pi/.config;
    rm -rf /home/pi/.pki;

    # Add our login cookies
    mkdir -p /home/pi/.config/chromium/Default
    chmod -R 777 /home/pi/.config/
    #sqlite3 /home/pi/.config/chromium/Default/Web\ Data "CREATE TABLE meta(key LONGVARCHAR NOT NULL UNIQUE PRIMARY KEY, value LONGVARCHAR); INSERT INTO meta VALUES('"'"'version'"'"','"'"'46'"'"'); CREATE TABLE keywords (foo INTEGER);";

    rm -rf /home/pi/.config/chromium/Default/Cookies
    sqlite3 /home/pi/.config/chromium/Default/Cookies "PRAGMA foreign_keys=OFF;
    BEGIN TRANSACTION;
    CREATE TABLE meta(key LONGVARCHAR NOT NULL UNIQUE PRIMARY KEY, value LONGVARCHAR);
    INSERT INTO \"meta\" VALUES('"'"'version'"'"','"'"'5'"'"');
    INSERT INTO \"meta\" VALUES('"'"'last_compatible_version'"'"','"'"'5'"'"');
    CREATE TABLE cookies (creation_utc INTEGER NOT NULL UNIQUE PRIMARY KEY,host_key TEXT NOT NULL,name TEXT NOT NULL,value TEXT NOT NULL,path TEXT NOT NULL,expires_utc INTEGER NOT NULL,secure INTEGER NOT NULL,httponly INTEGER NOT NULL,last_access_utc INTEGER NOT NULL, has_expires INTEGER NOT NULL DEFAULT 1, persistent INTEGER NOT NULL DEFAULT 1);
    INSERT INTO \"cookies\" VALUES(13061063029272912,'"'"'discourse.thegovlab.org'"'"','"'"'_t'"'"','"'"'962a5ae730cfdac0f79a6082a7ab0f0a'"'"','"'"'/'"'"',13692215029000000,0,1,13061068938651930,1,1);
    INSERT INTO \"cookies\" VALUES(13061063029272913,'"'"'discourse.thegovlab.org'"'"','"'"'_forum_session'"'"','"'"'BAh7B0kiD3Nlc3Npb25faWQGOgZFVEkiJWNjNWIwZDc0NTE4ODRkMjc1NTAxNGEyM2I5M2ZlNDU1BjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMW1CQTZZS2lDMXlzd0R4azdiL3dUQ3lmbGlxZzZ4RFJ0a2YrVTVUWW9nWUU9BjsARg'"'"','"'"'/'"'"',13692215029000000,0,1,13061068938651930,1,1);
    CREATE INDEX domain ON cookies(host_key);
    COMMIT;"

    # Disable DPMS / Screen blanking
    xset -dpms
    xset s off

    # Reset the framebuffers colour-depth
    fbset -depth $( cat /sys/module/*fb*/parameters/fbdepth );

    # Hide the cursor (move it to the bottom-right, comment out if you want mouse interaction)
    xwit -root -warp $( cat /sys/module/*fb*/parameters/fbwidth ) $( cat /sys/module/*fb*/parameters/fbheight )

    # Start the window manager (remove "-use_cursor no" if you actually want mouse interaction)
    matchbox-window-manager -use_titlebar no -use_cursor no &

    # Start the browser (See http://peter.sh/experiments/chromium-command-line-switches/)
    _IP=$(hostname -I) || true
    chromium --kiosk --disable-session-storage --disable-plugins --disable-plugins-discovery --disable-sync --low-end-device-mode --disable-infobars --proxy-server="127.0.0.1:8123;https=127.0.0.1:8123;socks=127.0.0.1:8123;sock4=127.0.0.1:8123;sock5=127.0.0.1:8123,ftp=127.0.0.1:8123" --app=http://govlab.github.io/berrycast/$_IP

done;
' > /boot/xinitrc

echo '
# Disable power management (assumes Realtek 8192cu chip)
# http://raspberrypi.stackexchange.com/questions/1384/how-do-i-disable-suspend-mode/4518#4518
# https://github.com/xbianonpi/xbian/issues/217
options 8192cu rtw_power_mgnt=0 rtw_enusbss=0 rtw_ips_mode=1
' > /etc/modprobe.d/8192cu.conf

echo '
# Censor X-Frame-Options to allow embedding of any website
censoredHeaders = X-Frame-Options, Strict-Transport-Security
' > /home/pi/.polipo
chown pi /home/pi/.polipo

# Install crontab
# turns the screen off at 6PM, and reboots machine to turn it back on in the
# morning
echo '
0 8 * * * apt-get update
0 9 * * * reboot
0 18 * * * tvservice -o > /dev/null
' > /home/pi/.berrycron
crontab /home/pi/.berrycron

sudo apt-get -y install matchbox chromium x11-xserver-utils sqlite3 polipo

sudo reboot
