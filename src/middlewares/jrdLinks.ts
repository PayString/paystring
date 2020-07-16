import config from '../config'

interface JrdLink {
  rel: string
  template: string
}

/**
 * @returns An array of JrdLinks containing PayID Discovery metadata.
 */
export default function generateLinks(): JrdLink[] {
  return [
    {
      rel: 'https://payid.org/ns/easy-checkout-url/1.0',
      template: `${config.discovery.easyCheckoutHost}/wallet/xrp/testnet/payto?receiverPayId={receiverPayId}&amount={amount}&nextURL={nextURL}?easyCheckoutSuccess=true`,
    },
  ]
}
