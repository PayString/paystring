# [<img src="img/payid-logo-color.png" alt="PayID" width="256" height="82" />](https://www.payid.org/)

[![License: Apache 2](https://img.shields.io/badge/license-Apache%202-brightgreen)](https://github.com/payid-org/payid/blob/master/LICENSE)
[![Public API Version: 1.0](https://img.shields.io/badge/Public%20API%20Version-1.0-blue)](https://github.com/payid-org/payid/blob/master/src/config.ts#L1)
[![Admin API Version: 2020-05-28](https://img.shields.io/badge/Admin%20API%20Version-2020--05--28-blue)](https://github.com/payid-org/payid/blob/master/src/config.ts#L2)

Welcome to PayID, the universal payment identifier.

This is the reference implementation server for [PayID](https://docs.payid.org/payid-overview), serving the [PayID API](https://api.payid.org/?version=latest). It uses TypeScript, a Node.js HTTP server, and a Postgres database.

By default, the server hosts [the PayID Protocol](https://github.com/payid-org/rfcs), or Public API, on port 8080. It also hosts a second RESTful API on port 8081 for CRUD operations of PayIDs and associated addresses.

If you just want to experiment with PayID, you can easily spin up a local server using `npm run devEnvUp` which uses our local [`docker-compose.yml`](./docker-compose.yml) file. If you want to work on the PayID server source code itself, you can spin up a Postgres database to develop against using `npm run devDbUp`.

To clean up the associated Docker containers, you can run `npm run devDown`.

## Further Reading

- [PayID Developer Documentation](https://docs.payid.org/payid-overview)
- [PayID API Documentation](https://api.payid.org/?version=latest)
- [Core PayID Protocol RFCs](https://github.com/payid-org/rfcs)

## Legal

By using, reproducing, or distributing this code, you agree to the terms and conditions for use (including the Limitation of Liability) in the [Apache License 2.0](https://github.com/payid-org/payid/blob/master/LICENSE). If you do not agree, you may not use, reproduce, or distribute the code.
