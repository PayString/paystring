/** A parsed HTTP Accept header object. */
export interface ParsedAcceptHeader {
  /** A raw Accept header media type. */
  readonly mediaType: string

  /** The payment network requested in the media type. */
  readonly paymentNetwork: string

  /**
   * The environment requested in the media type.
   *
   * Optional, as some headers (like application/ach+json) don't have an environment.
   */
  readonly environment?: string
}
