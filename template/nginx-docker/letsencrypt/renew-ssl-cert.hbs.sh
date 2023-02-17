#!/bin/bash
set -e

if [ -z "${HOST_NAME}" ]; then 
  echo "HOST_NAME var is not provided. Please enter the server hostname (e.g. example.com):"
  read -r HOST_NAME
fi

if [[ "${DRY_RUN}" = "true" ]]; then
  echo "DRY_RUN is set to true - will do the dry run (staging) - for test or debugging."
  DRY_RUN_STRING="--dry-run"
else
  echo "DRY_RUN is NOT set to true - will execute the PRODUCTION cert request (rate limit of 5 certs/week/host)"
  DRY_RUN_STRING=""
fi

if [[ -n "${STRATOGS_DIR_PATH}" ]]; then
  echo "STRATOGS_DIR_PATH is set to '${STRATOGS_DIR_PATH}'"
  if [[ ! -d "${STRATOGS_DIR_PATH}" ]]; then
    echo "Error: Directory ${STRATOGS_DIR_PATH} not found. Exit."
    exit 1
  fi
else
  _DEFAULT_STRATOGS_PATH='../../../strato-getting-started'
  echo "STRATOGS_DIR_PATH is not set, using default '${_DEFAULT_STRATOGS_PATH}'"
  if [[ -d "${_DEFAULT_STRATOGS_PATH}" ]]; then
    STRATOGS_DIR_PATH=${_DEFAULT_STRATOGS_PATH}
  else
    echo "WARNING: strato-getting-started default path does not exist. SSL cert/key won't be updated to be used for future STRATO-GS deployments."
    STRATOGS_DIR_PATH=''
  fi
fi

# Stop nginx using port 80
docker stop {{snake_case name}}_http-redirect_1

# Start letsencrypt nginx
docker-compose up -d

function cleanup {
  docker-compose down
  docker start {{snake_case name}}_http-redirect_1
}

trap cleanup EXIT

# Renew
docker run -i --rm \
  -v $(pwd)/letsencrypt-site:/data/letsencrypt \
  -v $(pwd)/letsencrypt-data/etc/letsencrypt:/etc/letsencrypt \
  -v $(pwd)/letsencrypt-data/var/lib/letsencrypt:/var/lib/letsencrypt \
  -v $(pwd)/letsencrypt-data/var/log/letsencrypt:/var/log/letsencrypt \
  certbot/certbot \
  renew ${DRY_RUN_STRING} --force-renewal --no-random-sleep-on-renew

printf "\nDone.\n\n"

if [[ "${DRY_RUN}" = "true" ]]; then
  echo "See above for a dry-run result. To actually renew the cert - execute the normal run."
  printf "\n\n"
else
  # Copy the new certs
  cert_path="letsencrypt-data/etc/letsencrypt/live/${HOST_NAME}/fullchain.pem"
  key_path="letsencrypt-data/etc/letsencrypt/live/${HOST_NAME}/privkey.pem"
    
  echo "Cert path: ${cert_path}"
  echo "Key path: ${key_path}"
  
  echo "Copying key and cert to the {{snake_case name}} nginx ssl dir..."
  set -x
  sudo cp ${cert_path} ../ssl/server.pem
  sudo cp ${key_path} ../ssl/server.key
  set +x
  if [[ -n "${STRATOGS_DIR_PATH}" ]]; then
    echo "Copying key and cert to the strato-getting-started ssl dir..."
    set -x
    sudo cp ${cert_path} ${STRATOGS_DIR_PATH}/ssl/certs/server.pem
    sudo cp ${key_path} ${STRATOGS_DIR_PATH}/ssl/private/server.key
    set +x
  fi
  
  echo "Copying key and cert to the live docker containers..."
  set -x
  sudo docker cp --follow-link ${cert_path} {{snake_case name}}_nginx_1:/etc/ssl/server.pem
  sudo docker cp --follow-link ${key_path} {{snake_case name}}_nginx_1:/etc/ssl/server.key
  
  sudo docker cp --follow-link ${cert_path} strato_nginx_1:/etc/ssl/certs/server.pem
  sudo docker cp --follow-link ${key_path} strato_nginx_1:/etc/ssl/private/server.key
  set +x
  
  echo "Reloading live nginx configurations..."
  set -x
  sudo docker exec {{snake_case name}}_nginx_1 nginx -s reload
  sudo docker exec strato_nginx_1 openresty -s reload
  set +x
  
  echo "Certs have been successfully renewed. No more actions required. See output above."
  printf "\n\n"
fi
