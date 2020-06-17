# PayID

Welcome to PayID, the universal payment identifier.

This is the reference implementation server for [PayID](https://docs.payid.org/docs/payid-overview), serving the [PayID API](https://api.payid.org/?version=latest). It uses TypeScript, a Node.js HTTP server, and a Postgres database.

By default, the server hosts [the PayID Protocol](https://github.com/payid-org/rfcs), or Public API, on port 8080. It also hosts a second RESTful API on port 8081 for CRUD operations of PayIDs and associated addresses.

If you just want to experiment with PayID, you can easily spin up a local server using `npm run devEnvUp` which uses our local [`docker-compose.yml`](./docker-compose.yml) file. If you want to work on the PayID server source code itself, you can spin up a Postgres database to develop against using `npm run devDbUp`.

To clean up the associated Docker containers, you can run `npm run devDown`.

## Further Reading

- [PayID Developer Documentation](https://docs.payid.org/docs/payid-overview)
- [PayID API Documentation](https://api.payid.org/?version=latest)
- [Core PayID Protocol RFCs](https://github.com/payid-org/rfcs)
