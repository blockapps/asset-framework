#!/usr/bin/env bash

set -ex

cp /nginx.tpl.conf /tmp/nginx.conf

if [ -n "$HOST_IP" ]; then
  echo "HOST_IP is provided and is '${HOST_IP}' - running in DEV mode"
  if [ "$HOST_IP" = "localhost" ] || [ "$HOST_IP" = "127.0.0.1" ]; then
    echo "HOST_IP cannot be 'localhost' or '127.0.0.1' - these are not accessible from within the docker container"
  fi
  # Remove prod mode lines from template:
  sed -i '/#TEMPLATE_MARK_PROD_MODE/d' /tmp/nginx.conf
  sed -i 's/<HOST_IP>/'"${HOST_IP}"'/g' /tmp/nginx.conf
else
  # Remove dev mode lines from template:
  sed -i '/#TEMPLATE_MARK_DEV_MODE/d' /tmp/nginx.conf
fi

if [ "$SSL" = true ]; then
  cp /tmp/ssl/server.key /etc/ssl/
	cp /tmp/ssl/server.${SSL_CERT_TYPE} /etc/ssl/
	sed -i 's/<SSL_CERT_TYPE>/'"$SSL_CERT_TYPE"'/g' /tmp/nginx.conf
else
  sed -i '/#TEMPLATE_MARK_SSL/d' /tmp/nginx.conf
fi

mv /tmp/nginx.conf /etc/nginx/

# Start nginx
nginx -g "daemon off;"
