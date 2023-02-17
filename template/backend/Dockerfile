FROM node:14-buster-slim

RUN apt-get update && \
  apt-get install -y apt-transport-https curl gnupg gnupg2 gnupg1 make libtool autoconf && \
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && \
  apt-get install -y yarn git lsof && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


HEALTHCHECK --interval=3s --timeout=2s --start-period=300s \
  CMD lsof -i :3030 || \
  exit 1

RUN mkdir -p /usr/src/backend

COPY . /usr/src/backend/

WORKDIR /usr/src/backend

RUN yarn install

CMD [ "bash", "/usr/src/backend/docker-run.sh" ]
