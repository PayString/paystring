import 'mocha'

//
// import * as request from 'supertest'
//
// import App from '../../../../src/app'
// import { mockComplianceData } from '../../../../src/data/travelRuleData'
// import { wrapMessage } from '../../../../src/services/signatureWrapper'
// import HttpStatus from '../../../../src/types/httpStatus'
// import {
// MessageType,
// AddressDetailsType,
// ComplianceType,
// PaymentSetupDetails,
// } from '../../../../src/types/publicAPI'
// import {
// appSetup,
// appCleanup,
// isExpectedPaymentSetupDetails,
// } from '../../../helpers/helpers'
// import logger from 'src/utils/logger'
//

// describe('E2E - publicAPIRouter - Travel Rule', function (): void {
// // Boot up Express application and initialize DB connection pool
// before(async function () {
//     app = await appSetup()
// })
//
// it('Returns PaymentSetupDetails on GET /payment-setup-details', function (done): void {
//     // GIVEN a PayID known to have a testnet address
//     const payId = '/alice'
//     const acceptHeader = 'application/xrpl-testnet+json'
//
//     // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- This is 1 hour in milliseconds
//     const TIME_TO_EXPIRY = 60 * 60 * 1000
//
//     const expectedPaymentSetupDetails: PaymentSetupDetails = {
//       txId: 148689,
//       expirationTime: Date.now() + TIME_TO_EXPIRY,
//       paymentInformation: {
//         addresses: [
//           {
//             paymentNetwork: 'XRPL',
//             environment: 'TESTNET',
//             addressDetailsType: AddressDetailsType.CryptoAddress,
//             addressDetails: {
//               address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
//             },
//           },
//         ],
//         payId: 'alice$127.0.0.1',
//       },
//       complianceRequirements: [ComplianceType.TravelRule],
//       complianceHashes: [],
//     }
//     const expectedResponse = wrapMessage(
//       expectedPaymentSetupDetails,
//       MessageType.PaymentSetupDetails,
//     )
//
//     // WHEN we make a GET request to the public endpoint to retrieve the PaymentSetupDetails
//     request(app.publicAPIExpress)
//       .get(`${payId}/payment-setup-details`)
//       .set('PayID-Version', '1.0')
//       .set('Accept', acceptHeader)
//       // THEN we get back a 200 - OK with the PaymentSetupDetails
//       .expect(isExpectedPaymentSetupDetails(expectedResponse))
//       .expect(HttpStatus.OK, done)
// })
//
// it.only('Returns an updated invoice on POST /invoice', function (done): void {
//     // GIVEN a PayID known to have a testnet address
//     const payId = '/alice'
//     const acceptHeader = 'application/xrpl-testnet+json'
//
//     // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- This is 1 hour in milliseconds.
//     const TIME_TO_EXPIRY = 60 * 60 * 1000
//     const expectedPaymentSetupDetails: PaymentSetupDetails = {
//       txId: 1,
//       expirationTime: Date.now() + TIME_TO_EXPIRY,
//       paymentInformation: {
//         addresses: [
//           {
//             paymentNetwork: 'XRPL',
//             environment: 'TESTNET',
//             addressDetailsType: AddressDetailsType.CryptoAddress,
//             addressDetails: {
//               address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
//             },
//           },
//         ],
//         payId: 'alice$127.0.0.1',
//       },
//       complianceRequirements: [ComplianceType.TravelRule],
//       complianceHashes: [
//         {
//           hash:
// eslint-disable-next-line max-len -- Temporarily for comment.
//             'c80e7e41231b9f40c93d3e911b64c382118b8fea3a6f7c1382333dc88a5acb9798c505c65052ad89c362f480f4d51cfea9f5c32266fd4e7aa683169cdb54ae3a',
//           type: ComplianceType.TravelRule,
//         },
//       ],
//     }
//
//     const expectedResponse = wrapMessage(
//       expectedPaymentSetupDetails,
//       MessageType.PaymentSetupDetails,
//     )
//
//     // WHEN we make a GET request to the public endpoint to retrieve the PaymentSetupDetails
//     request(app.publicAPIExpress)
//       .post(`${payId}/invoice?nonce=123`)
//       .set('Content-Type', 'application/json')
//       .set('Accept', acceptHeader)
//       .send(wrapMessage(mockComplianceData, MessageType.Compliance))
//       // THEN we get back the invoice
//       .expect(isExpectedPaymentSetupDetails(expectedResponse))
//       .expect(HttpStatus.OK, done)
// })
//
// // Shut down Express application and close DB connections
// after(function () {
//     appCleanup(app)
// })
