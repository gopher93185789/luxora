#!/bin/bash

if [ -d "$HOME/luxora" ]; then
  cd "$HOME/luxora"
else
  echo "Directory ~/luxora does not exist. Cloning."
  git clone https://github.com/gopher93185789/luxora.git || { echo "Git clone failed."; exit 1; }
  cd "$HOME/luxora"
fi

sudo cp /etc/letsencrypt/live/api.luxoras.nl/fullchain.pem /certificates/server/fullchain.pem
sudo cp /etc/letsencrypt/live/api.luxoras.nl/privkey.pem /certificates/server/privkey.pem

git fetch
git pull

docker compose down -v

docker rmi -f $(docker images -aq)

docker compose up -d


if [ $? -eq 0 ]; then
  echo "Deployment succeeded."
else
  echo "Deployment failed."
  exit 1
fi