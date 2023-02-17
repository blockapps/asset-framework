#!/bin/bash
set -e

# Validate configuration
if [ "${IS_BOOTNODE}" = "false" ]; then
  if [ ! -f "${CONFIG_DIR_PATH}/${DEPLOY_FILE_NAME}" ]; then
    echo "IS_BOOTNODE=false but there was no ${DEPLOY_FILE_NAME} provided in {{snake_case name}}_config docker volume. Exit."
    exit 53
  fi
else
  if [ ! -f "${CONFIG_DIR_PATH}/config.yaml" ]; then
    if [ -f "${CONFIG_DIR_PATH}/${DEPLOY_FILE_NAME}" ]; then
      echo "App misconfigured: IS_BOOTNODE=true, no config file but ${DEPLOY_FILE_NAME} is provided in docker volume. Exit."
      exit 54
    fi
  fi
fi

if [ ! -f "${CONFIG_DIR_PATH}/config.yaml" ]; then
  # Running container for the first time

  # Generating the ./config/generated.config.yaml - an intermediate step to avoid removing CONFIG var (that would break the non-docker deployment)
  cp ./config/template.config.yaml /tmp/tmp.config.yaml
  
  # Validate the env vars
  # TODO: check if EVERY env var is provided (in the for loop - refactor)
  if [ -z "${SERVER_HOST}" ]; then
    echo "SERVER_HOST is empty but is a required value"
    exit 11
  fi
  if [[ "${SERVER_HOST}" != "http"* ]]; then
    echo "SERVER_HOST must start with protocol (http:// or https://)"
    exit 111
  fi
  if [[ "${SERVER_HOST}" == *"\/" ]]; then
    echo "SERVER_HOST must not contain the trailing slash"
    exit 112
  fi
  
  if [ -z "${SERVER_IP}" ]; then
    echo "SERVER_IP is empty but is a required value"
    exit 12
  fi
  
  if [ -z "${NODE_LABEL}" ]; then
    echo "NODE_LABEL is empty but is a required value"
    exit 13
  fi
  
  if [[ "${STRATO_NODE_PROTOCOL}" == *":"* ]]; then
    echo "STRATO_NODE_PROTOCOL should be one of: 'http', 'https'"
    exit 17
  fi
  
  if [ "${STRATO_NODE_HOST}" == "http"* ]; then
    echo "STRATO_NODE_HOST must not include the protocol and can only include hostname and port"
    exit 18
  fi
  
  if [ -z "${OAUTH_OPENID_DISCOVERY_URL}" ]; then
    echo "OAUTH_OPENID_DISCOVERY_URL is empty but is a required value"
    exit 14
  fi
  
  if [ -z "${OAUTH_CLIENT_ID}" ]; then
    echo "OAUTH_CLIENT_ID is empty but is a required value"
    exit 15
  fi
  
  if [ -z "${OAUTH_CLIENT_SECRET}" ]; then
    echo "OAUTH_CLIENT_SECRET is empty but is a required value"
    exit 16
  fi
  
  # Create /etc/hosts record to resolve STRATO_HOST to STRATO_LOCAL_IP
  if [ -n "${STRATO_LOCAL_IP}" ]; then
    _STRATO_NODE_HOSTNAME=$(echo "${STRATO_NODE_HOST}" | cut -d ":" -f 1)
    _ETC_HOSTS_RECORD="${STRATO_LOCAL_IP} ${_STRATO_NODE_HOSTNAME}"
    echo "${_ETC_HOSTS_RECORD}" >> /etc/hosts
    echo "Record was added to /etc/hosts: '${_ETC_HOSTS_RECORD}'"
  fi
  
  sed -i 's*<apiDebug_value>*'"${API_DEBUG}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<configDirPath_value>*'"${CONFIG_DIR_PATH}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<deployFilename_value>*'"${DEPLOY_FILE_NAME}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<orgDeployFilename_value>*'"${ORG_DEPLOY_FILE_NAME}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<serverHost_value>*'"${SERVER_HOST}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<serverIP_value>*'"${SERVER_IP}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<node_label_value>*'"${NODE_LABEL}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<node_url_value>*'"${STRATO_NODE_PROTOCOL}://${STRATO_NODE_HOST}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<node_publicKey_value>*'"${NODE_PUBLIC_KEY}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<oauth_appTokenCookieName_value>*'"${OAUTH_APP_TOKEN_COOKIE_NAME}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<oauth_openIdDiscoveryUrl_value>*'"${OAUTH_OPENID_DISCOVERY_URL}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<oauth_clientId_value>*'"${OAUTH_CLIENT_ID}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<oauth_clientSecret_value>*'"${OAUTH_CLIENT_SECRET}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<oauth_scope_value>*'"${OAUTH_SCOPE}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<oauth_serviceOAuthFlow_value>*'"${OAUTH_SERVICE_OAUTH_FLOW}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<oauth_redirectUri_value>*'"${SERVER_HOST}/api/v1/authentication/callback"'*g' /tmp/tmp.config.yaml
  sed -i 's*<oauth_logoutRedirectUri_value>*'"${SERVER_HOST}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<oauth_tokenField_value>*'"${OAUTH_TOKEN_FIELD}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<oauth_tokenUsernameProperty_value>*'"${OAUTH_TOKEN_USERNAME_PROPERTY}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<oauth_tokenUsernamePropertyServiceFlow_value>*'"${OAUTH_TOKEN_USERNAME_PROPERTY_SERVICE_FLOW}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<orgName_value>*'"${ORG_NAME}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<adminName_value>*'"${ADMIN_NAME}"'*g' /tmp/tmp.config.yaml
  sed -i 's*<adminPassword_value>*'"${ADMIN_PASSWORD}"'*g' /tmp/tmp.config.yaml

  mv /tmp/tmp.config.yaml ./config/generated.config.yaml
  
  touch .env
  
  if test -f "${CONFIG_DIR_PATH}/${DEPLOY_FILE_NAME}"; then
    echo "deploy file exists - secondary node - nothing to deploy"
    CONFIG=generated yarn deploy:secondary-org
    cp ./config/generated.config.yaml /config/config.yaml
  else
    echo "deploy file does not exist - bootnode - running 'deploy'"
    CONFIG=generated yarn deploy
  fi
  
else
  # This container was already running before
  if test -f "${CONFIG_DIR_PATH}/${DEPLOY_FILE_NAME}"; then
    touch .env
    echo "Config and deploy files exist - skipping deploy and running the app"
    if [ ! -f "${CONFIG_DIR_PATH}/.deployed" ]; then
      echo "ERROR: Config and deploy files exist but the deploy was not successfully finished: if running the secondary node, most probably there was an error in deployment when the container was started for the first time"
      exit 52
    fi
  else
    echo "Error: the config.yaml file is provided but the deploy file is missing, please check the docker volume for /config"
    exit 51
  fi  
fi

touch ${CONFIG_DIR_PATH}/.deployed

echo 'Starting backend server...'
yarn start:prod
