/* eslint-disable max-lines -- I think it's fine to have > 500 lines for testing */
import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'
import 'mocha'

import App from '../../../../src/app'
import { adminApiVersions, payIdServerVersions } from '../../../../src/config'
import { AddressDetailsType } from '../../../../src/types/protocol'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App
const payIdApiVersion = adminApiVersions[0]
const payIdNextApiVersion = adminApiVersions[1]
const payIdProtocolVersion = payIdServerVersions[1]

const acceptPatch = 'application/merge-patch+json'

describe('E2E - adminApiRouter - PUT /users', function (): void {
  before(async function () {
    app = await appSetup()
  })

  it('Returns a 200 and updated user payload when updating an address', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    const updatedInformation = {
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
      verifiedAddresses: [],
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 200-OK, with the updated user information
      .expect(HttpStatus.OK, updatedInformation, done)
  })

  it('Returns a 200 and updated user payload when updating a verified address', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const updatedInformation = {
      payId: 'donaldduck$127.0.0.1',
      addresses: [],
      verifiedAddresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'MAINNET',
          details: {
            address: 'rfvRiqhpZW1NURByu3iDsLVMT3zkzzMhJD',
          },
          identityKeySignature:
            'bG9vayBhdCBtZSBJJ20gZW5jb2RpbiBnbW9yZSByYW5kb20gdHJhc2g=',
        },
      ],
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${updatedInformation.payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 200-OK, with the updated user information
      .expect(HttpStatus.OK, updatedInformation, done)
  })

  it('Returns a 200 and updated user payload when updating a PayID', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    const updatedInformation = {
      payId: 'charlie$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
      verifiedAddresses: [],
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 200-OK, with the updated user information
      .expect(HttpStatus.OK, updatedInformation, done)
  })

  it('Returns a 200 and updated user payload when removing all addresses', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'empty$xpring.money'
    const updatedInformation = {
      payId: 'empty$xpring.money',
      addresses: [],
      verifiedAddresses: [],
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect back a 200-OK, with the updated user information
      .expect(HttpStatus.OK, updatedInformation, done)
  })

  it('Returns a 200 when updating a user with the canonical format', function (done): void {
    // GIVEN a user with a PayID known to exist on the PayID service
    const updatedInformation = {
      payId: 'nextversion$127.0.0.1',
      version: payIdProtocolVersion,
      addresses: [
        {
          paymentNetwork: 'BTC',
          environment: 'TESTNET',
          addressDetailsType: AddressDetailsType.CryptoAddress,
          addressDetails: {
            address: 'n4VQ5YdHf7hLQ2gWQYYrcxoE5B7nWuDFNF',
          },
        },
      ],
      verifiedAddresses: [
        {
          payload: JSON.stringify({
            payId: 'nextversion$127.0.0.1',
            payIdAddress: {
              paymentNetwork: 'XRPL',
              environment: 'MAINNET',
              addressDetailsType: AddressDetailsType.CryptoAddress,
              addressDetails: {
                address: 'rBJwwXADHqbwsp6yhrqoyt2nmFx9FB83Th',
              },
            },
          }),
          signatures: [
            {
              name: 'identityKey',
              protected:
                'eyJuYW1lIjoiaWRlbnRpdHlLZXkiLCJhbGciOiJFUzI1NksiLCJ0eXAiOiJKT1NFK0pTT04iLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCIsIm5hbWUiXSwiandrIjp7ImNydiI6InNlY3AyNTZrMSIsIngiOiI2S0dtcEF6WUhWUm9qVmU5UEpfWTVyZHltQ21kTy1xaVRHem1Edl9waUlvIiwieSI6ImhxS3Vnc1g3Vjk3eFRNLThCMTBONUQxcW44MUZWMjItM1p0TURXaXZfSnciLCJrdHkiOiJFQyIsImtpZCI6Im4zNlhTc0M1TjRnNUtCVzRBWXJ5d1ZtRE1kUWNEV1BJX0RfNUR1UlNhNDAifX0',
              signature:
                'bG9vayBhdCBtZSBJIGp1c3QgdXBkYXRlZCB0aGlzIFBVVCBsZXRzIGdv',
            },
          ],
        },
      ],
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${updatedInformation.payId}`)
      .set('PayID-API-Version', payIdNextApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect back a 200-OK, with the updated user information
      // .expect(HttpStatus.OK, updatedInformation)
      .end(function () {
        request(app.adminApiExpress)
          .get(`/users/${updatedInformation.payId}`)
          .set('PayID-API-Version', payIdNextApiVersion)
          .expect('Content-Type', /json/u)
          // THEN we expect to have an Accept-Patch header in the response
          .expect('Accept-Patch', acceptPatch)
          // THEN We expect back a 200 - OK, with the account information
          .expect(HttpStatus.OK, updatedInformation, done)
      })
  })

  it('Throws BadRequest error on invalid protected payload (identity key)', function (done): void {
    // GIVEN a user with a PayID known to exist on the PayID service
    const payId = 'johnwick$127.0.0.1'
    const userInformation = {
      payId,
      addresses: [],
      verifiedAddresses: [
        {
          payload: JSON.stringify({
            payId,
            payIdAddress: {
              paymentNetwork: 'XRPL',
              environment: 'TESTNET',
              addressDetailsType: AddressDetailsType.CryptoAddress,
              addressDetails: {
                address: 'rMwLfriHeWf5NMjcNKVMkqg58v1LYVRGnY',
              },
            },
          }),
          signatures: [
            {
              name: 'identityKey',
              protected:
                'eiJKT1NFK0pTT04iLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCIsIm5hbWUiXSwiandrIjp7ImNydiI6InNlY3AyNTZrMSIsIngiOiI2S0dtcEF6WUhWUm9qVmU5UEpfWTVyZHltQ21kTy1xaVRHem1Edl9waUlvIiwieSI6ImhxS3Vnc1g3Vjk3eFRNLThCMTBONUQxcW44MUZWMjItM1p0TURXaXZfSnciLCJrdHkiOiJFQyIsImtpZCI6Im4zNlhTc0M1TjRnNUtCVzRBWXJ5d1ZtRE1kUWNEV1BJX0RfNUR1UlNhNDAifX0',
              signature: 'Z2V0IGxvdy4uIHdlaGVyIGV5b3UgZnJvbSBteSBib3kgYXNqZGFr',
            },
          ],
        },
      ],
    }
    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid JSON for protected payload (identity key).',
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdNextApiVersion)
      .send(userInformation)
      .expect('Content-Type', /json/u)
      // THEN We expect back a 400 - Bad Request, with the expected error response object
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Throws BadRequest error on multiple identity keys per PayID', function (done): void {
    // GIVEN a user with a PayID known to exist on the PayID service
    const payId = 'johnwick$127.0.0.1'
    const userInformation = {
      payId,
      addresses: [],
      verifiedAddresses: [
        {
          payload: JSON.stringify({
            payId,
            payIdAddress: {
              paymentNetwork: 'XRPL',
              environment: 'TESTNET',
              addressDetailsType: AddressDetailsType.CryptoAddress,
              addressDetails: {
                address: 'rMwLfriHeWf5NMjcNKVMkqg58v1LYVRGnY',
              },
            },
          }),
          signatures: [
            {
              name: 'identityKey',
              protected:
                'eyJuYW1lIjoiaWRlbnRpdHlLZXkiLCJhbGciOiJFUzI1NksiLCJ0eXAiOiJKT1NFK0pTT04iLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCIsIm5hbWUiXSwiandrIjp7ImNydiI6InNlY3AyNTZrMSIsIngiOiI2S0dtcEF6WUhWUm9qVmU5UEpfWTVyZHltQ21kTy1xaVRHem1Edl9waUlvIiwieSI6ImhxS3Vnc1g3Vjk3eFRNLThCMTBONUQxcW44MUZWMjItM1p0TURXaXZfSnciLCJrdHkiOiJFQyIsImtpZCI6Im4zNlhTc0M1TjRnNUtCVzRBWXJ5d1ZtRE1kUWNEV1BJX0RfNUR1UlNhNDAifX0',
              signature: 'Z2V0IGxvdy4uIHdlaGVyIGV5b3UgZnJvbSBteSBib3kgYXNqZGFr',
            },
          ],
        },
        {
          payload: JSON.stringify({
            payId,
            payIdAddress: {
              paymentNetwork: 'XRPL',
              environment: 'MAINNET',
              addressDetailsType: AddressDetailsType.CryptoAddress,
              addressDetails: {
                address: 'rsem3MPogcwLCD6iX34GQ4fAp4EC8kqMYM',
              },
            },
          }),
          signatures: [
            {
              name: 'identityKey',
              protected:
                'eyJuYW1lIjoiaWRlbnRpdHlLZXkiLCJhbGciOiJFUzI1NksiLCJ0eXAiOiJKT1NFK0pTT04iLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCIsIm5hbWUiXSwiandrIjp7ImNydiI6InNlY3AyNTZrMSIsIngiOiJKcXNXZk1QSmNsU1JISWRtS3U0cl84MktPRXdERjctOU1XeWFYcjNkSGl3IiwieSI6IkMxZm5sQndUMmZtNzN1OGxweEhlc0NiX0xobEx2aktoeTRGN05ZdWpDR0EiLCJrdHkiOiJFQyIsImtpZCI6IlRZSlNCb05FSDVHYzVDQ0hyc3pfMVM0RHhwNk9SZVhIWlQ5bmZiYXQ3YTAifX0',
              signature: 'Z2V0IGxvdy4uIHdlaGVyIGV5b3UgZnJvbSBteSBib3kgYXNqZGFr',
            },
          ],
        },
      ],
    }

    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 400,
      error: 'Bad Request',
      message:
        'More than one identity key detected. Only one identity key per PayID can be used.',
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdNextApiVersion)
      .send(userInformation)
      .expect('Content-Type', /json/u)
      // THEN We expect back a 400 - Bad Request, with the expected error response object
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Throws BadRequest error on multiple identity keys per address', function (done): void {
    // GIVEN a user with a PayID known to exist on the PayID service
    const payId = 'verified$127.0.0.1'
    const userInformation = {
      payId,
      addresses: [],
      verifiedAddresses: [
        {
          payload: JSON.stringify({
            payId,
            payIdAddress: {
              paymentNetwork: 'XRPL',
              environment: 'TESTNET',
              addressDetailsType: AddressDetailsType.CryptoAddress,
              addressDetails: {
                address: 'rMwLfriHeWf5NMjcNKVMkqg58v1LYVRGnY',
              },
            },
          }),
          signatures: [
            {
              name: 'identityKey',
              protected:
                'eyJuYW1lIjoiaWRlbnRpdHlLZXkiLCJhbGciOiJFUzI1NksiLCJ0eXAiOiJKT1NFK0pTT04iLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCIsIm5hbWUiXSwiandrIjp7ImNydiI6InNlY3AyNTZrMSIsIngiOiI2S0dtcEF6WUhWUm9qVmU5UEpfWTVyZHltQ21kTy1xaVRHem1Edl9waUlvIiwieSI6ImhxS3Vnc1g3Vjk3eFRNLThCMTBONUQxcW44MUZWMjItM1p0TURXaXZfSnciLCJrdHkiOiJFQyIsImtpZCI6Im4zNlhTc0M1TjRnNUtCVzRBWXJ5d1ZtRE1kUWNEV1BJX0RfNUR1UlNhNDAifX0',
              signature: 'Z2V0IGxvdy4uIHdlaGVyIGV5b3UgZnJvbSBteSBib3kgYXNqZGFr',
            },
            {
              name: 'identityKey',
              protected:
                'eyJuYW1lIjoiaWRlbnRpdHlLZXkiLCJhbGciOiJFUzI1NksiLCJ0eXAiOiJKT1NFK0pTT04iLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCIsIm5hbWUiXSwiandrIjp7ImNydiI6InNlY3AyNTZrMSIsIngiOiI2S0dtcEF6WUhWUm9qVmU5UEpfWTVyZHltQ21kTy1xaVRHem1Edl9waUlvIiwieSI6ImhxS3Vnc1g3Vjk3eFRNLThCMTBONUQxcW44MUZWMjItM1p0TURXaXZfSnciLCJrdHkiOiJFQyIsImtpZCI6Im4zNlhTc0M1TjRnNUtCVzRBWXJ5d1ZtRE1kUWNEV1BJX0RfNUR1UlNhNDAifX0',
              signature: 'd2Fsa2luZyB0aG91Z2ggdGhlIHNyZWV3dCB3aWggbXkgdDQ0',
            },
          ],
        },
      ],
    }

    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 400,
      error: 'Bad Request',
      message:
        'More than one identity key detected. Only one identity key per address can be used.',
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdNextApiVersion)
      .send(userInformation)
      .expect('Content-Type', /json/u)
      // THEN We expect back a 400 - Bad Request, with the expected error response object
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Returns a 201 and inserted user payload for a Admin API PUT creating a new user', function (done): void {
    // GIVEN a PayID known to not exist on the PayID service
    const payId = 'notjohndoe$xpring.money'
    const insertedInformation = {
      payId: 'johndoe$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
      verifiedAddresses: [],
    }

    // WHEN we make a PUT request to /users/ with the information to insert
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(insertedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect the Location header to be set to the path of the created user resource
      // Note that the PayID inserted is that of the request body, not the URL path
      .expect('Location', `/users/${insertedInformation.payId}`)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // AND we expect back a 201 - CREATED, with the inserted user information
      .expect(HttpStatus.Created, insertedInformation, done)
  })

  it('Returns a 201 and inserted user payload for a Admin API PUT creating a new user with an uppercase PayID provided', function (done): void {
    // GIVEN a PayID known to not exist on the PayID service
    const payId = 'notjohndoe$xpring.money'
    const newPayId = 'johnsmith$xpring.money'

    const insertedInformation = {
      payId: newPayId.toUpperCase(),
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
      verifiedAddresses: [],
    }

    // WHEN we make a PUT request to /users/ with the information to insert
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(insertedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect the Location header to be set to the path of the created user resource
      // Note that the PayID inserted is that of the request body, not the URL path, and we expect a lowercase response
      .expect('Location', `/users/${newPayId}`)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // AND we expect back a 201 - CREATED, with the inserted user information (but the PayID lowercased)
      .expect(
        HttpStatus.Created,
        { ...insertedInformation, ...{ payId: newPayId } },
        done,
      )
  })

  it('Returns a 201 when creating a new user with verifiedAddresses', function (done): void {
    // GIVEN a user with a PayID known to not exist on the PayID service
    const userInformation = {
      payId: 'harrypotter$xpring.money',
      addresses: [
        {
          paymentNetwork: 'BTC',
          environment: 'TESTNET',
          details: {
            address: 'mxNEbRXokcdJtT6sbukr1CTGVx8Tkxk3DB',
          },
        },
      ],
      verifiedAddresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDth',
          },
          identityKeySignature:
            'd2hhdCBhbSBJIGNvZGluZyB3aGF0IGlzIGxpZmUgcGxlYXNlIGhlbHA=',
        },
      ],
    }

    // WHEN we make a POST request to /users with that user information
    request(app.adminApiExpress)
      .put(`/users/${userInformation.payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(userInformation)
      // THEN we expect the Location header to be set to the path of the created user resource
      .expect('Location', `/users/${userInformation.payId}`)
      // THEN we expect back a 201 - CREATED
      .expect(HttpStatus.Created)
      .end(function () {
        request(app.adminApiExpress)
          .get(`/users/${userInformation.payId}`)
          .set('PayID-API-Version', payIdApiVersion)
          .expect('Content-Type', /json/u)
          // THEN we expect to have an Accept-Patch header in the response
          .expect('Accept-Patch', acceptPatch)
          // THEN We expect back a 200 - OK, with the account information
          .expect(HttpStatus.OK, userInformation, done)
      })
  })

  it('Returns a 400 - Bad Request with an error payload for a request with a malformed PayID', function (done): void {
    // GIVEN a PayID known to be in a bad format (missing $) and an expected error response payload
    const badPayId = 'alice.xpring.money'
    const expectedErrorResponse = {
      error: 'Bad Request',
      message: 'Bad input. PayIDs must contain a "$"',
      statusCode: 400,
    }
    const updatedInformation = {
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }
    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${badPayId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 400 - Bad Request, with the expected error payload response
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Returns a 400 - Bad Request with an error payload for a request with an existing PayID with multiple "$"', function (done): void {
    // GIVEN a PayID known to be in a bad format (multiple $) and an expected error response payload
    const badPayId = 'alice$bob$xpring.money'
    const expectedErrorResponse = {
      error: 'Bad Request',
      message: 'Bad input. PayIDs must contain only one "$"',
      statusCode: 400,
    }
    const updatedInformation = {
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }
    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${badPayId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 400 - Bad Request, with the expected error payload response
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Returns a 400 - Bad Request with an error payload for a request to update a PayID to a new value containing multiple "$"', function (done): void {
    // GIVEN a PayID known to be in a bad format (missing $) and an expected error response payload
    const badPayId = 'alice$xpring.money'
    const expectedErrorResponse = {
      error: 'Bad Request',
      message: 'Bad input. PayIDs must contain only one "$"',
      statusCode: 400,
    }
    const updatedInformation = {
      payId: 'alice$bob$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }
    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${badPayId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 400 - Bad Request, with the expected error payload response
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Returns a 409 - Conflict when attempting to update a user to a PayID that already exists', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'charlie$xpring.money'
    const updatedInformation = {
      // AND a request to update that PayID to one known to already exist on the PayID Service
      payId: 'bob$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }
    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 409,
      error: 'Conflict',
      message: 'There already exists a user with the provided PayID',
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 409 - CONFLICT and our expected error response
      .expect(HttpStatus.Conflict, expectedErrorResponse, done)
  })

  it('Returns a 409 - Conflict when attempting to PUT a new user to a PayID that already exists', function (done): void {
    // GIVEN a PayID known to not resolve to an account on the PayID service
    const payId = 'janedoe$xpring.money'
    // AND a request to update that PayID to one known to already exist on the PayID Service
    const updatedInformation = {
      payId: 'bob$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }
    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 409,
      error: 'Conflict',
      message: 'There already exists a user with the provided PayID',
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 409 - CONFLICT and our expected error response
      .expect(HttpStatus.Conflict, expectedErrorResponse, done)
  })

  it('Returns a 415 - Unsupported Media Type when sending a wrong Content-Type header', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    // We need to send the body as a String if Content-Type is not application/json.
    // Otherwise an error ERR_INVALID_ARG_TYPE will be thrown by Supertest in the send() method.
    const updatedInformation = `{
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }`

    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 415,
      error: 'Unsupported Media Type',
      message:
        "A 'Content-Type' header is required for this request: 'Content-Type: application/json'.",
    }

    // WHEN we make a PUT request to /users/:payId with that updated user information
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      // WITH a wrong Content-Type
      .set('Content-Type', 'application/xml')
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 415 - Unsupported Media Type and our expected error response
      .expect(HttpStatus.UnsupportedMediaType, expectedErrorResponse, done)
  })

  it('Returns a 415 - Unsupported Media Type when Content-Type header is missing', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    // We need to send the body as a String if Content-Type is not sent.
    // Otherwise Supertest will automatically add a "Content-Type: application/json" header.
    const updatedInformation = `{
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }`

    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 415,
      error: 'Unsupported Media Type',
      message:
        "A 'Content-Type' header is required for this request: 'Content-Type: application/json'.",
    }

    // WHEN we make a PUT request to /users/:payId with that updated user information
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      // WITHOUT a Content-Type
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 415 - Unsupported Media Type and our expected error response
      .expect(HttpStatus.UnsupportedMediaType, expectedErrorResponse, done)
  })

  after(function () {
    appCleanup(app)
  })
})
