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
- [8. Use Xpring SDK with PayID](#8-use-xpring-sdk-with-payid)
  - [8.1. Demo](#81-demo)

## Required Server Security

Here are several critical security measures you MUST implement when running this PayID server implementation:

### Private API

The Private API does not currently include authentication. Therefore, this API MUST only be exposed to trusted IP ranges, and MUST NOT be exposed publicly.

## 4. PayID integration and the PayID APIs

You can deploy your own PayID server and then create PayIDs for your users using the PayID Private API. You can also query and modify this list of users. This API should be exposed internally only, so that only your company's systems can update PayID mappings.

Once you have set up a PayID server, anyone can use the PayID Public API to query address information. This API is publicly accessible so that anyone can send payments to your users' PayID addresses.

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
