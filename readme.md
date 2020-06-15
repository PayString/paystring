# Table of Contents <!-- omit in toc -->

- [8. Use Xpring SDK with PayID](#8-use-xpring-sdk-with-payid)
  - [8.1. Demo](#81-demo)

## Required Server Security

Here are several critical security measures you MUST implement when running this PayID server implementation:

### Private API

The Private API does not currently include authentication. Therefore, this API MUST only be exposed to trusted IP ranges, and MUST NOT be exposed publicly.

## 4. PayID integration and the PayID APIs

You can deploy your own PayID server and then create PayIDs for your users using the PayID Private API. You can also query and modify this list of users. This API should be exposed internally only, so that only your company's systems can update PayID mappings.

Once you have set up a PayID server, anyone can use the PayID Public API to query address information. This API is publicly accessible so that anyone can send payments to your users' PayID addresses.

## 8. Use Xpring SDK with PayID

[Xpring SDK](https://www.xpring.io/docs) can be used to simplify the process of developing with PayID. Currently only the Node.js version is available, and Java and Swift will soon be available.

### 8.1. Demo

This demo uses PayID to resolve an address on the specified payment network, which is XRP Ledger in this case.

To execute this demo:

1. Clone the [Xpring SDK repo](https://github.com/xpring-eng/Xpring-SDK-Demo/).
2. Change to the `Xpring-SDK-Demo/node` directory.
3. Run `npm i` to install the dependencies.
4. Run `node src/index-payid.js` to execute the demo.

View [index-payid.js](https://github.com/xpring-eng/Xpring-SDK-Demo/blob/master/node/src/index-payid.js).
