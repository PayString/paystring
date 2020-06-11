# Table of Contents <!-- omit in toc -->

- [4. PayID integration and the PayID APIs](#4-payid-integration-and-the-payid-apis)
  - [4.1. Set up a PayID environment for development purposes](#41-set-up-a-payid-environment-for-development-purposes)
  - [4.2. Integrate PayID with existing user bases](#42-integrate-payid-with-existing-user-bases)
    - [4.2.1. Extend tables with new columns](#421-extend-tables-with-new-columns)
    - [4.2.2. Matching column names in data access functions](#422-matching-column-names-in-data-access-functions)
    - [4.2.3. Change the type of database](#423-change-the-type-of-database)
    - [4.2.4. Set environment variables](#424-set-environment-variables)
    - [4.2.5. Update database migrations](#425-update-database-migrations)
    - [4.2.6. Update SQL files](#426-update-sql-files)
- [5. Schemas](#5-schemas)
  - [5.1 Example single user schema](#51-example-single-user-schema)
  - [5.2 Example error schema](#52-example-error-schema)
  - [5.3. Example payment setup details schema](#53-example-payment-setup-details-schema)
  - [5.4. Example compliance message schema](#54-example-compliance-message-schema)
  - [5.5. Request headers](#55-request-headers)
- [6. Code examples](#6-code-examples)
  - [6.1 Payment](#61-payment)
  - [6.2 Generate a seed-based wallet](#62-generate-a-seed-based-wallet)
- [7. Interfaces](#7-interfaces)
  - [7.1. PaymentInformation](#71-paymentinformation)
  - [7.2. CryptoAddressDetails](#72-cryptoaddressdetails)
  - [7.3. AchAddressDetails](#73-achaddressdetails)
  - [7.4. Error](#74-error)
- [8. Use Xpring SDK with PayID](#8-use-xpring-sdk-with-payid)
  - [8.1. Demo](#81-demo)

## 4. PayID integration and the PayID APIs

You can deploy your own PayID server and then create PayIDs for your users using the PayID Private API. You can also query and modify this list of users. This API should be exposed internally only, so that only your company's systems can update PayID mappings.

Once you have set up a PayID server, anyone can use the PayID Public API to query address information. This API is publicly accessible so that anyone can send payments to your users' PayID addresses.

### 4.1. Set up a PayID environment for development purposes

To ease the deployment of a development environment, the PayID application includes scripts to quickly and easily deploy a Postgres database and a PayID server.

Please make sure Docker (including docker-compose) is installed on your machine and run the following commands:

```sh
git clone git@github.com:xpring-eng/payid.git
npm run devEnvUp
```

You can then use the Private and Public PayID APIs as defined further in this document.
So `npm run devEnvUp` is useful if you just want a PayID server to develop some other service against (a good example would be the Xpring Wallet).

![Open Source](img/open_source.png)

---

If you only wish to create a Postgres container without the PayID server, simply run:

```sh
npm run devDbUp
```

You would run `npm run devDbUp` if you wanted to actually work on the PayID server source code itself.

The Postgres container listens on port 5432.

You will need to start PayID separately, using `npm run start`.

---

Finally, you can remove the full development environment (Postgres and PayID) or only Postgres by running:

```sh
npm run devDown
```

**IMPORTANT**: running `npm run devDown` will remove the Postgres container and all your data will be lost.

**Docker information**

The Postgres Docker image used is the version 12 alpine.
https://hub.docker.com/_/postgres

### 4.2. Integrate PayID with existing user bases

If you have an existing user database, you will need to take the following steps to integrate PayID functionality into your product.

#### 4.2.1. Extend tables with new columns

The PayID [account schema](./src/db/schema/01_account.sql) is used to define a table for users.

The account table contains two fields: `id` and `pay_id`. The address table uses a foreign key column called `account_id` which depends on id as a foreign key to associate addresses with individual accounts. The second column is `pay_id` which is where we store the string identifier (ex: `alice$wallet.com`). With an existing user database, you will need to add the `pay_id` column. It is likely that your user data base already has the equivalent of an `id` field, but if not it will be important to add this as well so that addresses can reference a specific user.

Regarding constraints, there are three constraints in our account schema that could be useful in applying to your existing user database. The first two guarantee that all entered PayIDs are lowercase and are not empty strings. The final and most important constraint is the regex constraint `valid_pay_id` which guarantees that all entered PayIDs are in compliance with the format outlined in the PayID whitepaper.

The PayID [address schema](./src/db/schema/02_address.sql) is used to define a table of addresses associated with users.

Whenever a PayID is queried the payment network and environment are sent via an accept header. Therefore, it is important that each address stored has an associated payment network and environment. For example, upon receipt of the accept header `application/xrpl-testnet+json` you should query your address table for the address associated with the `xrpl` payment network and `testnet` environment.

#### 4.2.2. Matching column names in data access functions

All functions that query the database are located in [src/data-access](./src/data-access). If you decide to use column names that do not match what we have defined in [src/db/schema](./src/db/schema) then you must reflect those changes in the data access functions. Below is a table of all the files contained within [src/data-access](./src/data-access) and the corresponding column names they use:

| File name                  | Columns used                                                                                                  |
| -------------------------- | :------------------------------------------------------------------------------------------------------------ |
| src/data-access/payIds.ts  | address.payment_network, address.environment, address.details                                                 |
| src/data-access/reports.ts | address.payment_network, address.environment                                                                  |
| src/data-access/users.ts   | account.pay_id, account.id, address.account_id, address.payment_network, address.environment, address.details |

#### 4.2.3. Change the type of database

In this reference implementation we use a Postgres database. If you would like to use a different type of database, you need to either update settings in the [knexfile](./src/db/knex.ts) or replace the use of knex throughout the repository with your preferred database connection tool.

#### 4.2.4. Set environment variables

PayID depends on a number of environment variables. All environment variables are read in [src/config.ts](./src/config.ts) and assigned to variables. During integration you should look through all of the environment variables used in [src/config.ts](./src/config.ts) and [example.production.env](./example.production.env) to ensure all are set properly for your environment.

#### 4.2.5. Update database migrations

If you are using your own database, there are migration files written specifically for the tables outlined in [src/db/schema](./src/db/schema). You will need to either remove these migration files or update them to match your database.

#### 4.2.6. Update SQL files

There are a number of .sql files within [src/db](./src/db) that are all executed by the function syncDatabaseSchema located in [src/db/syncDatabaseSchema.ts](./src/db/syncDatabaseSchema.ts). For integration into an existing system it is important to look through the directories in [src/db](./src/db) to identify any .sql files that you need to modify to fit your existing system or remove because they do not apply.

## 5. Schemas

These schemas are used for request or response payloads for various requests.

### 5.1 Example single user schema

A single user can have multiple destinations, because the same user can have addresses on different networks for different currencies. This schema is used as a payload with a request to create a user, or as a response to a request to get information about a user.

```json
{
  "payId": "johndoe$xpring.money",
  "addresses": [
    {
      "paymentNetwork": "XRPL",
      "environment": "TESTNET",
      "details": {
        "address": "TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDth"
      }
    },
    {
      "paymentNetwork": "XRPL",
      "environment": "MAINNET",
      "details": {
        "address": "X7zmKiqEhMznSXgj9cirEnD5sWo3iZSbeFRexSFN1xZ8Ktn"
      }
    }
  ]
}
```

| Field                      | Description                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `payId`                    | PayID user address                                                                                                                             |
| `addresses`                | Object that includes payment address information for one or more payment networks.                                                             |
| `addresses.paymentNetwork` | A payment network, like the bitcoin network, the XRPL, or ACH.                                                                                 |
| `addresses.environment`    | "Environment" of the payment network for this payment address. For example, the XPRL has MAINNET, TESTNET, and DEVNET.                         |
| `address.details`          | Actual payment information for this address. Must be in the form `CryptoAddressDetails` or `AchAddressDetails`. See [Interfaces](#interfaces). |

### 5.2 Example error schema

This example shows the format of an error payload.

```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "Your data is bad"
}
```

### 5.3. Example payment setup details schema

This example shows the format of a payment setup details object.

```JSON
{
  "messageType": "PaymentSetupDetails",
  "message": {
    "txId": 578392,
    "expirationTime": "2020-03-18T04:04:02",
    "paymentInformation": {
      "addressDetailsType": "CryptoAddressDetails",
      "addressDetails": {
        "address": "T71Qcu6Txyi5y4aa6ZaVBD3aKC4oCbQTBQr3QfmJBywhnwm"
      },
      "proofOfControlSignature": "9743b52063cd84097a65d1633f5c74f5",
      "paymentPointer": "$xpring.money/dino",
      "memo": "this is an XRP testnet address"
    },
    "complianceRequirements": ["TravelRule"],
    "memo": "please send me travel rule data",
    "complianceHashes": []
  },
  "pkiType": "x509+sha256",
  "pkiData": [],
  "publicKey": "00:c9:22:69:31:8a:d6:6c:ea:da:c3:7f:2c:ac:a5:af:c0:02:ea:81:cb:65:b9:fd:0c:6d:46:5b:c9:1e:9d:3b:ef",
  "signature": "8b:c3:ed:d1:9d:39:6f:af:40:72:bd:1e:18:5e:30:54:23:35..."
}
```

### 5.4. Example compliance message schema

```JSON
{
   "messageType":"compliance",
   "message":{
      "type":"TravelRule",
      "data":{
         "originator":{
            "userLegalName":"Theodore Kalaw",
            "accountId":"ef841530-f476-429c-b8f3-de25a0a29f80 ",
            "userPhysicalAddress":"520 Main Street",
            "institutionName":"xpring",
            "value":{
               "amount":"100",
               "scale":1
            },
            "timestamp":"2020-03-20T07:09:00"
         },
         "beneficiary":{
            "institutionName":"xpring"
         }
      },
      "memo": "payment from Theodore for consulting",
   },
   "pkiType":"x509+sha256",
   "pkiData":[

   ],
   "publicKey":"00:c9:22:69:31:8a:d6:6c:ea:da:c3:7f:2c:ac:a5:\n    af:c0:02:ea:81:cb:65:b9:fd:0c:6d:46:5b:c9:1e:\n    9d:3b:ef",
   "signature":"8b:c3:ed:d1:9d:39:6f:af:40:72:bd:1e:18:5e:30:54:23:35..."
}
```

### 5.5. Request headers

The values accepted for XRP are:

| Accept header                 |              Description |
| ----------------------------- | -----------------------: |
| application/xrpl-mainnet+json | Returns mainnet xAddress |
| application/xrpl-testnet+json | Returns testnet xAddress |
| application/xrpl-devnet+json  |  Returns devnet xAddress |

PayID is a fundamentally neutral protocol. When you make a request, the HTTP `Accept` header of the request specifies the payment network and environment, and PayID is therefore capable of returning a user's address information for any network in which that user participates.

An example request has this form.

```HTTP
GET /{user} HTTP/1.1

Accept: application/xrpl-testnet+json
```

The different header options are shown here, with example values.

| Currency | Header                        | Address payload                                                        |
| :------- | :---------------------------- | :--------------------------------------------------------------------- |
| BTC      | application/btc+json          | { <br>address: '1BvBMSEYstWetAu4m4GFg7xJaNVN2'<br> }                   |
| XRP      | application/xrpl-mainnet+json | { <br>address: 'XV5sbjUmgPpvXv4ixFWZ5ptAYZ6PD28Sq49uo34VyjnmK5H'<br> } |
| ACH      | application/ach+json          | { <br> account: '363023456079',<br>routing: '011302838'<br>}           |
| All      | application/payid+json        | Variable depending on the contents of each address                     |

## 6. Code examples

### 6.1 Payment

This example demonstrates a payment to `alice$institution.com`.

```javascript
const axios = require('axios')
const btc = require('bitcoinjs-lib')

async function pay(payId, amount) {
  const user = payId.split('$')[0]
  const url = payId.split('$')[1]

  const response = await axios.get({
    method: 'GET',
    baseURL: 'https://' + url + '/' + user
    headers: { accept: 'application/btc+json' }
  }
  const tx = await new btc.Transaction(address, amount)
}
pay('alice$institution.com', 0.63)
```

### 6.2 Generate a seed-based wallet

In this example, you generate a seed-based wallet using the Xpring SDK. See [Xpring SDK docs](https://xpring.io/docs).

```javascript
// Xpring SDK
const { Wallet } = require('xpring-js')

const wallet = Wallet.generateWalletFromSeed('snRiAJGe3zRwiYDBm1M')
const tx = await wallet.send(0.63, 'alice$institution.com')
```

## 7. Interfaces

### 7.1. PaymentInformation

```ts
interface PaymentInformation {
  addressDetailsType: AddressDetailsType
  addressDetails: CryptoAddressDetails | AchAddressDetails
  proofOfControlSignature?: string
  payId?: string
  memo?: string
}
```

### 7.2. CryptoAddressDetails

```ts
interface CryptoAddressDetails {
  address: string
  tag?: string
}
```

### 7.3. AchAddressDetails

```ts
interface AchAddressDetails {
  accountNumber: string
  routingNumber: string
}
```

### 7.4. Error

```ts
interface Error {
  statusCode: integer
  error: string
  message: string
}
```

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
