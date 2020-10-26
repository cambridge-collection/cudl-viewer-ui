# syntax = docker/dockerfile:1.0-experimental
#
# Note: --ssh argument must be provided to `docker image build` cmd to use host
# ssh credentials.
#
FROM node:14.14.0-alpine3.10 as base
WORKDIR /opt/devserver

FROM base as builder

# Install ssh client and git
RUN apk add --no-cache openssh-client git bash

# Download public key for github.com
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan bitbucket.org >> ~/.ssh/known_hosts

COPY bower.json ./
RUN npm install bower
RUN --mount=type=ssh node_modules/.bin/bower --allow-root install

COPY package.json package-lock.json ./
RUN --mount=type=ssh npm ci


FROM base
RUN chown node:node .
COPY --chown=node:node --from=builder /opt/devserver .
EXPOSE 8080
USER node:node
ENV PATH=/opt/devserver/node_modules/.bin:$PATH
CMD [ \
    "webpack", \
     "--mode=development", \
     "serve", \
     "--host", "0.0.0.0" \
]
