#!/bin/bash

docker stop -t 2 payid
docker rm payid

set -e

demo_dir=$(dirname "$0")

cd ${demo_dir}/../

docker build -f demo/Dockerfile -t payid_demo:latest .
docker run --name payid -d -p 8080:8080 -p 8081:8081 payid_demo:latest

echo -e "\n\n\nPayID is now availabe on localhost:8080 and localhost:8081\nYou can stop the demo by running 'docker stop -t 1 payid'\n\n"
