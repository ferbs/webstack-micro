FROM node:10.16.3-alpine AS base
RUN apk add --update --no-cache \
  bash \
# note: you'll likely want postgres and a user table for authentication instead of redis. If so:
# postgresql postgresql-client postgresql-dev libpq \
  redis
RUN mkdir -p /passportjs-auth /usr/local/yarn_cache /usr/local/shared-constants && \
  chmod -R o+rw /usr/local/yarn_cache && \
  addgroup -S appgroup && \
  adduser -D -s /bin/bash -h /passportjs-auth nodeuser -G appgroup && \
  chown -R nodeuser:appgroup /passportjs-auth
ENV YARN_CACHE_FOLDER=/usr/local/yarn_cache



FROM base AS development
USER nodeuser
WORKDIR /passportjs-auth
COPY ./app/package.json .



FROM base AS release
USER nodeuser
WORKDIR /passportjs-auth
COPY ./app /passportjs-auth
RUN yarn install --production
EXPOSE 4001
CMD [ "yarn", "start" ]




