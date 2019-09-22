FROM node:10.16.3-alpine AS base

RUN apk add --update --no-cache \
 bash \
 nginx
RUN mkdir -p /frontend-web /usr/local/shared-constants && \
  addgroup -S www && \
  adduser -D -s /bin/bash -h /frontend-web www -G www && \
  mkdir -p /frontend-web/dist/nginx-html /usr/local/yarn_cache && \
  chmod -R o+rw /usr/local/yarn_cache && \
  cp /var/lib/nginx/html/50x.html /frontend-web/dist/nginx-html/ && \
  chown -R www:www /frontend-web


FROM base AS development
USER root
COPY ./nginx.conf /etc/nginx/nginx.conf
RUN chown -R www /var/tmp/nginx /var/lib/nginx /var/log/nginx /etc/nginx
USER www
WORKDIR /frontend-web
EXPOSE 8080


FROM base AS dependencies
USER www
WORKDIR /frontend-web
COPY ./app/package.json .
RUN yarn install


# this is an intermediate build step for release/production. The release step copies the final dist dir but not node_modules and such
FROM dependencies AS build_dist
USER www
WORKDIR /frontend-web
COPY ./app  .
RUN yarn build


FROM dependencies AS release
USER www
WORKDIR /frontend-web
# todo: copy node_modules from dependencies
COPY --from=build_dist /frontend-web/dist /frontend-web/dist
USER root
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]


