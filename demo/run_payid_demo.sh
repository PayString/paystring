#!/bin/bash

set -e

#echo -e "\n\nPlease enter a short, single-word alphanumeric name to use as the subdomain for your PayID demo server: "
#read ngrok_subdomain
ngrok_subdomain=notNeededForThisWorkshop
set +e

docker stop -t 2 payid > /dev/null
docker rm payid > /dev/null

set -e

demo_dir=$(dirname "$0")

cd ${demo_dir}/../

docker build -f demo/Dockerfile -t payid_demo:latest .
docker run --env NGROK_SUBDOMAIN=${ngrok_subdomain} --name payid -d -p 8080:8080 -p 8081:8081 payid_demo:latest

echo -e "\n\n\nPayID is now available on localhost:8080 and localhost:8081\nYou can stop the demo by running 'docker stop -t 1 payid'\n\n"

echo -e "Now that your PayID is running, let's walk through a travel rule payment. Instructions are in ./instructions.md"
