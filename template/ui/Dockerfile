FROM node:14-buster-slim

RUN apt-get update && \
  apt-get install -y apt-transport-https curl gnupg gnupg2 gnupg1 && \
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && \
  apt-get install -y yarn git lsof && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

HEALTHCHECK --interval=3s --timeout=2s --start-period=300s \
  CMD lsof -i :3000 || \
  exit 1

RUN mkdir -p /usr/src/ui

COPY . /usr/src/ui/

WORKDIR /usr/src/ui/

RUN yarn install && \
  yarn global add serve@13.0.2 && \
  REACT_APP_IN_DOCKER=true REACT_APP_UI_VERSION=$(node -e "console.log(require('./package.json').version);") yarn build && \
  rm -rf node_modules

CMD [ "sh", "/usr/src/ui/docker-run.sh" ]
