FROM ruby:2.6.4-alpine AS base

RUN apk add --update --no-cache \
  bash \
  build-base

RUN mkdir -p /backend-api && \
  addgroup -S appgroup && \
  adduser -D -s /bin/bash -h /backend-api appuser -G appgroup && \
  chown -R appuser:appgroup /backend-api
USER appuser
WORKDIR /backend-api
ENV GEM_HOME /backend-api/gem_bundle
ENV BUNDLE_PATH /backend-api/gem_bundle
ENV GEM_PATH /backend-api/gem_bundle
ENV PATH $GEM_HOME/bin:$GEM_HOME/gems/bin:$PATH
RUN mkdir -p $BUNDLE_PATH && gem install bundler


FROM base AS development
USER appuser
WORKDIR /backend-api
EXPOSE 3000


FROM base AS build
USER appuser
WORKDIR /backend-api
COPY ./app/Gemfile .
RUN bundle install --without development test


FROM build AS release
USER appuser
COPY ./app /backend-api
EXPOSE 3000

