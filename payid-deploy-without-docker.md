If you want to set up and run a PayID server, you have several options. This document describes how to run a PayID server without using Docker.

For other ways to deploy a PayID server, see:
* [Run the demo script](https://github.com/xpring-eng/payid/blob/loisrp-no-docker-deploy/readme.md#set-up-a-payid-server)
* [Set up PayID on AWS](aws-deploy.md)

Before you begin, make sure that you have installed Postgres locally, or in an otherwise accessible location.

1. Clone the PayID repo.
   `git clone https://github.com/xpring-eng/payid.git && cd payid`
2. Install dependencies.

   `npm i`
3. Generate the build files in `build/*` (app code + SQL scripts).

   `npm run build`
4. Start PayID. The `npm run start` command generates the schema if it does not yet exist.

   ```
   DB_HOSTNAME=localhost DB_NAME=dev_payid DB_USERNAME=payid_dev

   DB_PASSWORD='xxxxx' npm run start
   ```
5. To make sure PayID runs continuously, run PayID through a tool like `forever`.

   `npm install forever -g`
6. Run PayID with `forever`.

   ```
   DB_HOSTNAME=localhost DB_NAME=dev_payid DB_USERNAME=payid_dev

   DB_PASSWORD='xxxxx' forever start build/src/index.js
   ```
