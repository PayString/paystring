import { PaymentInformation } from '../types/publicAPI'

/**
 * Optionally allows injection of a memo
 * @param paymentInformation - PaymentInformation of response so far
 *
 * Returns PaymentInformation updated with memo if it is not an empty string
 */
export default function appendMemo(
  paymentInformation: PaymentInformation,
): PaymentInformation {
  const updatedPaymentInformation = paymentInformation

  const memo = createMemo()

  if (memo !== '') {
    updatedPaymentInformation.memo = memo
  }
  return updatedPaymentInformation
}

/**
 * This function is expected to be overwritten by companies deploying
 * PayID servers. It is expected that this function would query other
 * internal systems to attach metadata to a transaction.
 *
 * @param paymentInformation - PaymentInformation of response so far
 *
 * Returns a string to be attached as memo.
 */
function createMemo(): string {
  return ''
}
