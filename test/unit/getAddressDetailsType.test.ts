import { assert } from 'chai'

import { getAddressDetailsType } from '../../src/services/basePayId'
import { AddressDetailsType } from '../../src/types/publicAPI'

describe('Base PayID - getAddressDetailsType()', function (): void {
  it('Returns FiatAddressDetails for addressDetailsType when formatting ACH AddressInformation', function () {
    // GIVEN an array of AddressInformation with a single ACH (empty environment) entry
    const addressInfo = {
      paymentNetwork: 'ACH',
      environment: null,
      details: {
        accountNumber: '000123456789',
        routingNumber: '123456789',
      },
    }

    // WHEN we get the address details type
    const addressDetailsType = getAddressDetailsType(addressInfo)

    // THEN we get back an AddressDetailsType of FiatAddress
    assert.deepStrictEqual(addressDetailsType, AddressDetailsType.FiatAddress)
  })

  it('Returns CryptoAddressDetails for addressDetailsType when formatting XRP AddressInformation', function () {
    // GIVEN an array of AddressInformation with a single XRP entry
    const addressInfo = {
      paymentNetwork: 'XRP',
      environment: 'TESTNET',
      details: {
        address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
      },
    }

    // WHEN we get the address details type
    const addressDetailsType = getAddressDetailsType(addressInfo)

    // THEN we get back an AddressDetailsType of CryptoAddress
    assert.deepStrictEqual(addressDetailsType, AddressDetailsType.CryptoAddress)
  })
})
