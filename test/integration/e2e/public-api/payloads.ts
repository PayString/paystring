import { Address, AddressDetailsType } from '../../../../src/types/protocol'

export const XRPL_TESTNET_ACCEPT_HEADER = 'application/xrpl-testnet+json'
export const XRPL_MAINNET_ACCEPT_HEADER = 'application/xrpl-mainnet+json'

export const XRPL_TESTNET_ADDRESS: Address = {
  paymentNetwork: 'XRPL',
  environment: 'TESTNET',
  addressDetailsType: AddressDetailsType.CryptoAddress,
  addressDetails: {
    address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
  },
}

export const XRPL_MAINNET_ADDRESS: Address = {
  paymentNetwork: 'XRPL',
  environment: 'MAINNET',
  addressDetailsType: AddressDetailsType.CryptoAddress,
  addressDetails: {
    address: 'rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg',
    tag: '67298042',
  },
}

export const SIGNATURE = {
  name: 'identityKey',
  protected: 'aGV0IG1lIHNlZSB0aGVtIGNvcmdpcyBOT1cgb3IgcGF5IHRoZSBwcmljZQ==',
  signature:
    'TG9vayBhdCBtZSEgd29vIEknbSB0ZXN0aW5nIHRoaW5ncyBhbmQgdGhpcyBpcyBhIHNpZ25hdHVyZQ==',
}
