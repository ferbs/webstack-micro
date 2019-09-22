FROM rabbitmq:3.7.17-management-alpine

RUN apk add --no-cache bash

# from https://github.com/docker-library/healthcheck/blob/master/rabbitmq/docker-healthcheck
COPY healthcheck.sh /usr/local/bin/
# note: worker was making a lot of noise trying to connect to rabbitmq too early. Adding a healthcheck didn't help but I decided
# to leave it in anyway.

HEALTHCHECK CMD ["healthcheck.sh"]
