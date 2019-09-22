#!/bin/sh
PREFIX=${PROJ_NAME:-webstack}
# todo: exit if run outside of project root
docker-compose -f docker-compose.common.yml -f docker-compose.development.yml --project-name ${PREFIX} "$@"
