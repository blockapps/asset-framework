#!/bin/bash
set -e

# runniing 'sudo docker-compose down -vt0 && sudo ./run-app.sh' cleans the app data and then runs from scratch


export IS_BOOTNODE='true'
export API_DEBUG='true'
export SERVER_HOST='<SERVER_HOST>'                                      # ex: https://localhost
export SERVER_IP='<SERVER_IP>'                                          # ex: 123.123.123.123
export NODE_LABEL='<NODE_LABEL>'                                         # ex: {{snake_case name}}_secondary                         
export OAUTH_APP_TOKEN_COOKIE_NAME='<OAUTH_APP_TOKEN_COOKIE_NAME>'      # ex: {{lower name}}-node1-session
export OAUTH_OPENID_DISCOVERY_URL='<OAUTH_OPENID_DISCOVERY_URL>'        # ex: https://<oauth provider url>/.well-known/openid-configuration
export OAUTH_CLIENT_ID='<OAUTH_CLIENT_ID>'                              # ex: abcdef
export OAUTH_CLIENT_SECRET='<OAUTH_CLIENT_SECRET>'                      # ex: 'abcdef12-abcd-abcd-abcd-abcdefabcedf'
export OAUTH_TOKEN_USERNAME_PROPERTY='preferred_username'               # Do not change unless you know what you are doing.
export OAUTH_TOKEN_USERNAME_PROPERTY_SERVICE_FLOW='preferred_username'  # Do not change unless you know what you are doing.
export STRATO_NODE_PROTOCOL='https'
export STRATO_NODE_HOST='<STRATO_NODE_HOST>'                            # ex: node1.mercata-testnet.blockapps.net
export SSL=true
export SSL_CERT_TYPE=pem
export DAEMONS_ENABLED='true'

#if SSL=false look for the following block in docker-compose.yml and comment it out

# Comment out this entire block when deploying to Docker locally with SSL off
#
#   http-redirect:
#     depends_on:
#       - nginx
#     image: appName-http-redirect:latest
#     build: ./nginx-docker/redirect-http-to-https
#     restart: always
#     ports:
#       - 80:80
#     logging:
#       driver: "json-file"
#       options:
#         max-size: "100m"
#         max-file: "3"


#CUSTOM_NPM_SCRIPT__OPTIONAL

docker-compose up -d --build

