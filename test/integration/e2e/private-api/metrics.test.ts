import { assert } from 'chai'
import * as request from 'supertest'

import 'mocha'
import App from '../../../../src/app'
import { generatePayIdCountMetrics } from '../../../../src/services/payIdReport'
import HttpStatus from '../../../../src/types/httpStatus'
import { appCleanup, appSetup } from '../../../helpers/helpers'

let app: App

describe('E2E - privateAPIRouter - GET /metrics', function (): void {
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
      /payid_lookup_request\{paymentNetwork="ACH",environment="MAINNET",org="undefined",result="found"\} 1/u,
    )
  })

  it('Counts 1 not_found metric if PayID not found', async function () {
    const account = 'vic-vinegar'
    const payId = asPayId(account)
    const network = 'ETH'
    await createPayId(payId, network, testnet)
    await lookupPayId('bogus', asAccept(network, testnet), HttpStatus.NotFound)
    await assertMetrics(
      /payid_lookup_request\{paymentNetwork="ETH",environment="TESTNET",org="undefined",result="not_found"\} 1/u,
    )
  })

  it('Counts 1 error metric if PayID lookup errors', async function () {
    const account = 'pepe-silva'
    const payId = asPayId(account)
    await createPayId(payId, ' ', mainnet)
    await lookupPayId(account, ' ', HttpStatus.BadRequest)
    await assertMetrics(
      /payid_lookup_request\{paymentNetwork="unknown",environment="unknown",org="undefined",result="error: bad_accept_header"\} 1/u,
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
      /payid_lookup_request\{paymentNetwork="XRPL",environment="MAINNET",org="undefined",result="found"\} 2/u,
    )
    await assertMetrics(
      /payid_lookup_request\{paymentNetwork="BTC",environment="TESTNET",org="undefined",result="found"\} 1/u,
    )
  })

  it('Includes count of all PayIDs', async function () {
    const achNetwork = 'ACH'
    const litecoinNetwork = 'LTC'
    await createPayId('charlie$fightmilk.com', achNetwork, 'US')
    await createPayId('mac$fightmilk.com', achNetwork, 'US')
    await createPayId('frank$wolfcola.com', litecoinNetwork, 'MAINNET')
    await generatePayIdCountMetrics()
    await assertMetrics(
      /payid_count\{paymentNetwork="ACH",environment="US",org="undefined"\} 2/u,
    )
    await assertMetrics(
      /payid_count\{paymentNetwork="LTC",environment="MAINNET",org="undefined"\} 1/u,
    )
  })

  async function assertMetrics(expectedMetric: RegExp): Promise<request.Test> {
    return request(app.privateAPIExpress)
      .get('/metrics')
      .expect((res) => {
        assert.match(res.text, expectedMetric)
      })
      .then((res) => res.body)
  }

  async function lookupPayId(
    account: string,
    accept: string,
    status: HttpStatus,
  ): Promise<request.Test> {
    return request(app.publicAPIExpress)
      .get(`/${account}`)
      .set('Accept', accept)
      .expect((res) => {
        assert.strictEqual(res.status, status)
      })
      .then((res) => res.body)
  }

  async function createPayId(
    payId: string,
    paymentNetwork: string,
    environment: string,
  ): Promise<request.Test> {
    const payIdRequest = {
      pay_id: payId,
      addresses: [
        {
          payment_network: paymentNetwork,
          environment,
          details: {
            address: 'test',
          },
        },
      ],
    }
    return request(app.privateAPIExpress)
      .post(`/v1/users`)
      .send(payIdRequest)
      .expect((res) => {
        assert.strictEqual(res.status, HttpStatus.Created)
      })
      .then((res) => res.body)
  }
})
