#!/bin/bash
killall nginx
rm logs/*
/usr/local/openresty/nginx/sbin/nginx -p `pwd` -c conf/nginx.conf

#rm -rf /var/www/blog
#cp -r ./blog /var/www/
