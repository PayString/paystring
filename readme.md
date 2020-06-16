# PayID

Welcome to PayID.

This is the reference implementation server for PayID. It uses TypeScript, a Node.js HTTP server, and a Postgres database.

By default, it supports the PayID Protocol, or Public API, on port 8080. It also hosts a second RESTful API on port 8081 for CRUD operations of PayIDs and associated addresses.

If you just want to experiment with PayID, you can easily spin up a local server using `npm run devEnvUp` which uses our local [`docker-compose.yml`](./docker-compose.yml) file. If you want to work on the PayID server source code itself, you can spin up a Postgres database to develop against using `npm run devDbUp`.

To clean up the associated Docker containers, you can run `npm run devDown`.

## Further Reading

- Our developer documentation can be found [here](https://docs.payid.org/docs/payid-overview).

- Documentation on the PayID API can be found [here](https://api.payid.org/?version=latest).

- RFCs about the core PayID protocol can be found [here](https://github.com/payid-org/rfcs).
