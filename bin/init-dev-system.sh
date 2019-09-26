#!/bin/sh

HOST=${WEBSTACK_HOST:-webstack.loc}

# note: postgres fails if ".gitkeep" is present in mounted-volumes/postgres-main.
echo "Ensuring data directories exist in ./mounted-volumes"
mkdir -p ./mounted-volumes/postgres-main
mkdir -p ./mounted-volumes/rabbitmq-broker
mkdir -p ./mounted-volumes/redis-main
mkdir -p ./mounted-volumes/yarn_cache

if [ -f .env ]; then
  echo ".env file already exists. Make sure it contains the environment variables listed in example.env"
else
   echo "Copying env.development.example to .env"
   cp env.development.example .env
fi

if ! grep -q "$HOST" "/etc/hosts"; then
  echo "Your /etc/hosts file needs:\n  127.0.0.1 webstack.loc\n  127.0.0.1 ws.webstack.loc"
fi


echo "Building dev-mode Docker containers for all services..."
bin/dev.sh build

echo "Installing dev-mode npm packages for passportjs-auth"
bin/dev.sh run --no-deps passportjs-auth yarn install
bin/dev.sh run --no-deps passportjs-auth yarn build:ts
echo "Installing dev-mode npm packages for websocket-push"
bin/dev.sh run --no-deps websocket-push yarn install
echo "Installing dev-mode npm packages for frontend-web"
bin/dev.sh run --no-deps frontend-web yarn install
echo "Installing dev-mode ruby gems for backend-api"
bin/dev.sh run backend-api bundle install
