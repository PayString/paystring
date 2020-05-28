/**
 * This function is expected to be overwritten by companies deploying
 * PayID servers. It is expected that this function would query other
 * internal systems to attach metadata to a transaction.
 *
 * @param paymentInformation - PaymentInformation of response so far
 *
 * Returns a string to be attached as memo.
 */
export default function createMemo(): string {
  return ''
}
