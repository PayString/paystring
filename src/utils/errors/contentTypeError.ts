import HttpStatus from '@xpring-eng/http-status'

import PayIDError from './payIdError'

/**
 * A custom error type to organize logic around 415 - Unsupported Media Type errors.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/415|MDN Unsupported Media Type (415)}.
 */
export default class ContentTypeError extends PayIDError {
  public readonly kind: string

  /**
   * The constructor for new ContentTypeError.
   *
   * @param mediaType - The Media Type (also called Content Type) required by the request.
   */
  public constructor(
    mediaType: 'application/json' | 'application/merge-patch+json',
  ) {
    // All content type errors are the result of a 415 Unsupported Media Type error
    const message = `A 'Content-Type' header is required for this request: 'Content-Type: ${mediaType}'.`
    super(message, HttpStatus.UnsupportedMediaType)
    this.kind = 'UnsupportedMediaTypeHeader'
  }
}
