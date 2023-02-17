#!/bin/bash
set -e

# Running 'sudo docker-compose down -v -t 0' will clean the app data and bring down active docker containers.

# Make sure to follow the steps in the README about deploying a secondary node first before running this script.
APP_CONFIG_VOLUME_DIR=$(docker volume inspect --format '\{{ .Mountpoint }}' <PROJECT_DIRECTORY_NAME>_config)

if [ ! -f "${APP_CONFIG_VOLUME_DIR}/{{lower name}}.deploy.yaml" ] 
  then
    echo "{{lower name}}.deploy.yaml is missing from ${APP_CONFIG_VOLUME_DIR} - please make sure it exists before running this script...";
    exit 1;
fi

export IS_BOOTNODE='false'
export API_DEBUG='true'
export SERVER_HOST='<SERVER_HOST>'
export SERVER_IP='<SERVER_IP>'
export NODE_LABEL='{{snake_case name}}_secondary'

export OAUTH_APP_TOKEN_COOKIE_NAME='<OAUTH_APP_TOKEN_COOKIE_NAME>'
export OAUTH_OPENID_DISCOVERY_URL='<OAUTH_OPENID_DISCOVERY_URL>'
export OAUTH_CLIENT_ID='<OAUTH_CLIENT_ID>'
export OAUTH_CLIENT_SECRET='<OAUTH_CLIENT_SECRET>'
export OAUTH_TOKEN_USERNAME_PROPERTY='preferred_username'
export OAUTH_TOKEN_USERNAME_PROPERTY_SERVICE_FLOW='preferred_username'
export STRATO_NODE_PROTOCOL='https'
export STRATO_NODE_HOST='<STRATO_NODE_HOST>'
export SSL=true
export SSL_CERT_TYPE=pem
export DAEMONS_ENABLED='true'

#CUSTOM_NPM_SCRIPT__OPTIONAL

docker-compose up -d --build