#!/bin/bash

set -e

echo -e "\n\nPlease enter a short, single-word alphanumeric name to use as the subdomain for your PayID demo server: "
read ngrok_subdomain

set +e

docker stop -t 2 payid > /dev/null
docker rm payid > /dev/null

set -e

demo_dir=$(dirname "$0")

cd ${demo_dir}/../

docker build -f demo/Dockerfile -t payid_demo:latest .
docker run --env NGROK_SUBDOMAIN=${ngrok_subdomain} --name payid -d -p 8080:8080 -p 8081:8081 payid_demo:latest

echo -e "\n\nSample curl commands to run against your PayID demo server:"

echo -en """\n\ncurl --location --request POST http://localhost:8081/v1/users \
--header 'Content-Type: application/json' \
--data-raw '{"""

echo "
    \"payment_pointer\": \"\$${ngrok_subdomain}.ng.xpring.dev/${ngrok_subdomain}\",
    \"addresses\": [
        {
            \"payment_network\": \"XRPL\",
            \"environment\": \"TESTNET\",
            \"details\": {
                \"address\": \"TVnGpXXZZ3xAZfhT42ntuCR4Uh3Rv9LE4BcZJeH1zds2CQ2\"
            }
        }
    ]
}'
"

echo """curl --location --request GET https://${ngrok_subdomain}.ng.xpring.dev/${ngrok_subdomain} --header 'Accept: application/xrpl-testnet+json'"""

echo -e "\n\n\nPayID is now available on localhost:8080 and localhost:8081\nYou can stop the demo by running 'docker stop -t 1 payid'\n\n"

echo -e "You can access the public API of your PayID server over the internet at https://${ngrok_subdomain}.ng.xpring.dev\n"
