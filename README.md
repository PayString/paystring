# [<img src="img/paystring-logo-color.png" alt="PayString" width="430" height="82" />](https://www.paystring.org/)

[![License: Apache 2](https://img.shields.io/badge/license-Apache%202-brightgreen)](https://github.com/PayString/paystring/blob/master/LICENSE)
[![Public API Version: 1.1](https://img.shields.io/badge/Public%20API%20Version-1.1-blue)](https://github.com/PayString/paystring/blob/master/src/config.ts#L1)
[![Admin API Version: 2020-08-28](https://img.shields.io/badge/Admin%20API%20Version-2020--08--25-blue)](https://github.com/PayString/paystring/blob/master/src/config.ts#L2)

Welcome to PayString, the universal payment identifier.

This is the reference implementation server for [PayString](https://docs.paystring.org/getting-started), serving the [PayString API](https://api.paystring.org/?version=latest). It uses TypeScript, a Node.js HTTP server, and a Postgres database.

By default, the server hosts the Public API, which conforms to the PayString Protocol, on port 8080. The server also hosts a second RESTful API on port 8081 for CRUD (Create/Read/Update/Delete) operations to manage PayStrings and associated addresses.

To experiment with PayString, you can start a local server by running `npm run devEnvUp`, which uses our local [`docker-compose.yml`](./docker-compose.yml) file, which implicitly starts both a database and a PayString server inside Docker containers. To work on the PayString server source code itself, you can start a Postgres database to develop against by running `npm run devDbUp`, which starts a database in a Docker container, and a local PayString server.

To clean up the associated Docker containers after you create a local server or database container, run `npm run devDown`.

## Further Reading

- [PayString Developer Documentation](https://docs.paystring.org/getting-started)
- [PayString API Documentation](https://api.paystring.org/?version=latest)
- [Core PayString Protocol RFCs](https://github.com/PayString/rfcs)

## Legal

By using, reproducing, or distributing this code, you agree to the terms and conditions for use (including the Limitation of Liability) in the [Apache License 2.0](https://github.com/PayString/paystring/blob/master/LICENSE). If you do not agree, you may not use, reproduce, or distribute the code.
