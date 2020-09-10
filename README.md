# [<img src="img/payid-logo-color.png" alt="PayID" width="256" height="82" />](https://www.payid.org/)

[![License: Apache 2](https://img.shields.io/badge/license-Apache%202-brightgreen)](https://github.com/payid-org/payid/blob/master/LICENSE)
[![Public API Version: 1.0](https://img.shields.io/badge/Public%20API%20Version-1.0-blue)](https://github.com/payid-org/payid/blob/master/src/config.ts#L1)
[![Admin API Version: 2020-05-28](https://img.shields.io/badge/Admin%20API%20Version-2020--05--28-blue)](https://github.com/payid-org/payid/blob/master/src/config.ts#L2)

Welcome to PayID, the universal payment identifier.

_This project is not associated with PayID operated by NPP Australia Ltd. People in Australia are prohibited from using this project. See below for more details._

This is the reference implementation server for [PayID](https://docs.payid.org/payid-overview), serving the [PayID API](https://api.payid.org/?version=latest). It uses TypeScript, a Node.js HTTP server, and a Postgres database.

By default, the server hosts the Public API, which conforms to the PayID Protocol, on port 8080. The server also hosts a second RESTful API on port 8081 for CRUD (Create/Read/Update/Delete) operations to manage PayIDs and associated addresses.

To experiment with PayID, you can start a local server by running `npm run devEnvUp`, which uses our local [`docker-compose.yml`](./docker-compose.yml) file, which implicitly starts both a database and a PayID server inside Docker containers. To work on the PayID server source code itself, you can start a Postgres database to develop against by running `npm run devDbUp`, which starts a database in a Docker container, and a local PayID server.

To clean up the associated Docker containers after you create a local server or database container, run `npm run devDown`.

## Further Reading

- [PayID Developer Documentation](https://docs.payid.org/payid-overview)
- [PayID API Documentation](https://api.payid.org/?version=latest)
- [Core PayID Protocol RFCs](https://github.com/payid-org/rfcs)

## Legal

By using, reproducing, or distributing this code, you agree to the terms and conditions for use (including the Limitation of Liability) in the [Apache License 2.0](https://github.com/payid-org/payid/blob/master/LICENSE). If you do not agree, you may not use, reproduce, or distribute the code. **This code is not authorised for download in Australia. Any persons located in Australia are expressly prohibited from downloading, using, reproducing or distributing the code.** This code is not owned by, or associated with, NPP Australia Limited, and has no sponsorship, affiliation or other connection with the “Pay ID” service operated by NPP Australia Limited in Australia.
