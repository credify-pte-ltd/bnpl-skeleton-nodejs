FROM node:alpine

COPY . /demo

WORKDIR /demo

RUN yarn install

USER node

ENTRYPOINT ["/bin/sh", "-c", "yarn start" ]
