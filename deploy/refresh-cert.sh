certbot renew --force-renewal
cp /etc/letsencrypt/live/api.luxoras.nl/fullchain.pem /home/azure/luxora/certificates/server/fullchain.pem
cp /etc/letsencrypt/live/api.luxoras.nl/privkey.pem /home/azure/luxora/certificates/server/privkey.pem