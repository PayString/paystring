import HttpStatus from '@xpring-eng/http-status'
import { assert } from 'chai'
import * as request from 'supertest'

import 'mocha'
import App from '../../../../src/app'
import metrics from '../../../../src/services/metrics'
import { appCleanup, appSetup } from '../../../helpers/helpers'

let app: App
const payIdApiVersion = '2020-05-28'

describe('E2E - adminApiRouter - GET /metrics', function (): void {
  const mainnet = 'MAINNET'
  const testnet = 'TESTNET'
  const asPayId = (account: string): string => `${account}$127.0.0.1`
  const asAccept = (network: string, environment: string): string =>
    `application/${network}-${environment}+json`

  before(async function () {
    app = await appSetup()
  })

  after(function () {
    appCleanup(app)
  })

  it('Counts found metric if PayID found', async function () {
    const account = 'hugh-honey'
    const payId = asPayId(account)
    const network = 'ACH'
    await createPayId(payId, network, mainnet)
    await lookupPayId(account, asAccept(network, mainnet), HttpStatus.OK)
    await assertMetrics(
      /payid_lookup_request\{paymentNetwork="ACH",environment="MAINNET",org="127.0.0.1",result="found"\} 1/u,
    )
  })

  it('Counts 1 not_found metric if PayID not found', async function () {
    const account = 'vic-vinegar'
    const payId = asPayId(account)
    const network = 'ETH'
    await createPayId(payId, network, testnet)
    await lookupPayId('bogus', asAccept(network, testnet), HttpStatus.NotFound)
    await assertMetrics(
      /payid_lookup_request\{paymentNetwork="ETH",environment="TESTNET",org="127.0.0.1",result="not_found"\} 1/u,
    )
  })

  it('Counts 1 error metric if PayID lookup errors', async function () {
    const account = 'pepe-silva'
    const payId = asPayId(account)
    await createPayId(payId, ' ', mainnet)
    await lookupPayId(account, ' ', HttpStatus.BadRequest)
    await assertMetrics(
      /payid_lookup_request\{paymentNetwork="unknown",environment="unknown",org="127.0.0.1",result="error: bad_accept_header"\} 1/u,
    )
  })

  it('Counts multiple lookups and metrics', async function () {
    const xrpAccount = 'rickety-cricket'
    const xrpPayId = asPayId(xrpAccount)
    const xrpNetwork = 'XRPL'
    await createPayId(xrpPayId, xrpNetwork, mainnet)

    const btcAccount = 'chardee-mcdennis'
    const btcPayId = asPayId(btcAccount)
    const btcNetwork = 'BTC'
    await createPayId(btcPayId, btcNetwork, 'TESTNET')

    await lookupPayId(xrpAccount, asAccept(xrpNetwork, mainnet), HttpStatus.OK)
    await lookupPayId(xrpAccount, asAccept(xrpNetwork, mainnet), HttpStatus.OK)
    await lookupPayId(btcAccount, asAccept(btcNetwork, testnet), HttpStatus.OK)
    await assertMetrics(
      /payid_lookup_request\{paymentNetwork="XRPL",environment="MAINNET",org="127.0.0.1",result="found"\} 2/u,
    )
    await assertMetrics(
      /payid_lookup_request\{paymentNetwork="BTC",environment="TESTNET",org="127.0.0.1",result="found"\} 1/u,
    )
  })

  it('Includes count of all addresses', async function () {
    const achNetwork = 'ACH'
    const litecoinNetwork = 'LTC'
    await createPayId('charlie$fightmilk.com', achNetwork, 'US')
    await createPayId('mac$fightmilk.com', achNetwork, 'US')
    await createPayId('frank$wolfcola.com', litecoinNetwork, 'MAINNET')
    await metrics.generateAddressCountMetrics()

    await assertMetrics(
      /payid_count\{paymentNetwork="ACH",environment="US",org="127.0.0.1"\} 2/u,
    )
    await assertMetrics(
      /payid_count\{paymentNetwork="LTC",environment="MAINNET",org="127.0.0.1"\} 1/u,
    )
  })

  it('Includes count of all PayIDs', async function () {
    await metrics.generatePayIdCountMetrics()

    // We create 8 PayIDs in the tests before this one,
    // and start with 5 seeded PayIDs, for a total of 13.
    await assertMetrics(/actual_payid_count\{org="127.0.0.1"\} 13/u)
  })

  /**
   * A helper function that fetches PayID metrics and matches them against
   * expected metrics.
   *
   * @param expectedMetric - The expected metric to match on.
   * @returns The HTTP response from a GET to the /metrics endpoint on the Admin API.
   */
  async function assertMetrics(expectedMetric: RegExp): Promise<request.Test> {
    return request(app.adminApiExpress)
      .get('/metrics')
      .set('PayID-API-Version', payIdApiVersion)
      .expect((res) => {
        assert.match(res.text, expectedMetric)
      })
      .then(async (res) => res.body)
  }

  /**
   * A helper function to return address information for a PayID.
   *
   * @param account - The PayID to retrieve.
   * @param acceptHeader - The Accept header to send.
   * @param status - The status code returned by the request.
   *
   * @returns The HTTP response from a GET to the / endpoint on the Public API.
   */
  async function lookupPayId(
    account: string,
    acceptHeader: string,
    status: HttpStatus,
  ): Promise<request.Test> {
    return request(app.publicApiExpress)
      .get(`/${account}`)
      .set('PayID-Version', '1.0')
      .set('Accept', acceptHeader)
      .expect((res) => {
        assert.strictEqual(res.status, status)
      })
      .then(async (res) => res.body)
  }

  /**
   * A helper function to create a PayID.
   *
   * @param payId - The PayID to create.
   * @param paymentNetwork - The payment network for the address entry (e.g. XRPL).
   * @param environment - The environment for the address entry (e.g. TESTNET).
   *
   * @returns The HTTP response from a POST to the /users endpoint on the Admin API.
   */
  async function createPayId(
    payId: string,
    paymentNetwork: string,
    environment: string,
  ): Promise<request.Test> {
    const payIdRequest = {
      payId,
      addresses: [
        {
          paymentNetwork,
          environment,
          details: {
            address: 'test',
          },
        },
      ],
    }
    return request(app.adminApiExpress)
      .post(`/users`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(payIdRequest)
      .expect((res) => {
        assert.strictEqual(res.status, HttpStatus.Created)
      })
      .then(async (res) => res.body)
  }
})
