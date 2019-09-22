FROM node:10.16.3-alpine AS base

RUN apk add --update --no-cache \
  bash \
  redis

RUN mkdir -p /passportjs-auth /usr/local/yarn_cache /usr/local/shared-constants && \
  chmod -R o+rw /usr/local/yarn_cache && \
  addgroup -S appgroup && \
  adduser -D -s /bin/bash -h /websocket-push nodeuser -G appgroup && \
  chown -R nodeuser:appgroup /websocket-push
ENV YARN_CACHE_FOLDER=/usr/local/yarn_cache


FROM base AS development
USER nodeuser
WORKDIR /websocket-push
COPY ./app/package.json .
RUN yarn install



FROM dependencies AS release
USER nodeuser
WORKDIR /websocket-push
COPY ./app /websocket-push
EXPOSE 8001
RUN yarn install --production
CMD [ "yarn", "start" ]






