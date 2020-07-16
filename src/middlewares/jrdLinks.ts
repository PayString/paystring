import config from '../config'

/**
 * Represents a Link object in a PayID Discovery JRD (JSON Resource Descriptor).
 */
interface JrdLink {
  rel: string
  template: string
}

/**
 * Generate a list of JrdLinks to return as a result of PayID Discovery.
 *
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
