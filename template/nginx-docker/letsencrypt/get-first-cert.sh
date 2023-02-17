#!/bin/bash
set -e

if [ -z "${HOST_NAME}" ]; then 
  echo "HOST_NAME var is not provided. Please enter the server hostname (e.g. example.com):"
  read -r HOST_NAME
fi

sed 's/__HOST_NAME__/'"${HOST_NAME}"'/g' nginx-get-first-cert.tpl.conf > nginx-get-first-cert.conf



echo "Nginx config for letsencrypt site was created."

if [[ "${DRY_RUN}" = "true" ]]; then
  echo "DRY_RUN is set to true - will do the dry run (staging) - for test or debugging."
  DRY_RUN_STRING="--dry-run"
else
  echo "DRY_RUN is NOT set to true - will execute the PRODUCTION cert request (rate limit of 5 certs/week/host)"
  DRY_RUN_STRING=""
fi

echo "Continue with letsencrypt certificate request? Press Enter to confirm..."
read -s -n 1 key
if [[ $key != "" ]]; then
  exit 0
fi

if [ -z "${ADMIN_EMAIL}" ]; then 
  echo "ADMIN_EMAIL var is not provided. Please enter the admin email address:"
  read -r ADMIN_EMAIL
fi

docker-compose up -d

function cleanup {
  docker-compose down
}

trap cleanup EXIT

docker run -it --rm \
  -v $(pwd)/letsencrypt-site:/data/letsencrypt \
  -v $(pwd)/letsencrypt-data/etc/letsencrypt:/etc/letsencrypt \
  -v $(pwd)/letsencrypt-data/var/lib/letsencrypt:/var/lib/letsencrypt \
  -v $(pwd)/letsencrypt-data/var/log/letsencrypt:/var/log/letsencrypt \
  certbot/certbot \
  certonly ${DRY_RUN_STRING} --webroot --email "${ADMIN_EMAIL}" --agree-tos --no-eff-email --webroot-path=/data/letsencrypt -d "${HOST_NAME}"

printf "\nDone.\n\n"

if [[ "${DRY_RUN}" = "true" ]]; then
  echo "See above for a dry-run result. To generate the cert - execute the normal run."
  printf "\n\n"
else
  cert_path="letsencrypt-data/etc/letsencrypt/live/${HOST_NAME}/fullchain.pem"
  key_path="letsencrypt-data/etc/letsencrypt/live/${HOST_NAME}/privkey.pem"
  echo "Cert path: ${cert_path}"
  echo "Key path: ${key_path}"
  echo "(use sudo to access)"
  printf "\n\n"
  echo "Example commands to copy to project's nginx AND STRATO Getting Started (optional) ssl directories. Feel free to copy all 4 lines and execute in one paste:"
  echo "sudo cp ${cert_path} ../ssl/server.pem"
  echo "sudo cp ${key_path} ../ssl/server.key"
  echo "sudo cp ${cert_path} ../../../strato-getting-started/ssl/certs/server.pem"
  echo "sudo cp ${key_path} ../../../strato-getting-started/ssl/private/server.key"
  printf "\n\n"
fi
