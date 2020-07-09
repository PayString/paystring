import HttpStatus from '@xpring-eng/http-status'

import PayIDError from './payIdError'

/**
 * An enum containing the different kinds of Media Types (but also sometimes called "Content Types") used by the PayID server.
 */
export enum MediaType {
  ApplicationJson = 'application/json',
  ApplicationMergePatchJson = 'application/merge-patch+json',
}

/**
 * A custom error type to organize logic around 415 - Unsupported Media Type errors.
 * Https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/415.
 */
export default class ContentTypeError extends PayIDError {
  public readonly kind: string

  /**
   * The constructor for new ContentTypeError.
   *
   * @param mediaType - The Media Type (also called Content Type) required by the request.
   */
  public constructor(mediaType: MediaType) {
    // All content type errors are the result of a 415 Unsupported Media Type error
    const message = `A 'Content-Type' header is required for this request: 'Content-Type: ${mediaType}'.`
    super(message, HttpStatus.UnsupportedMediaType)
    this.kind = 'UnsupportedMediaTypeHeader'
  }
}
