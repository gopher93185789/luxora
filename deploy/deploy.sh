#!/bin/bash

if [ -d "$HOME/luxora" ]; then
  cd "$HOME/luxora"
else
  echo "Directory ~/luxora does not exist. Cloning."
  git clone https://github.com/gopher93185789/luxora.git || { echo "Git clone failed."; exit 1; }
  cd "$HOME/luxora"
fi


git fetch
git pull

sudo cp /etc/letsencrypt/live/api.luxoras.nl/fullchain.pem "$HOME/luxora"/certificates/server/fullchain.pem
sudo cp /etc/letsencrypt/live/api.luxoras.nl/privkey.pem "$HOME/luxora"/certificates/server/privkey.pem

docker compose down -v

docker rmi -f $(docker images -aq)

docker compose up -d


if [ $? -eq 0 ]; then
  echo "Deployment succeeded."
else
  echo "Deployment failed."
  exit 1
fi