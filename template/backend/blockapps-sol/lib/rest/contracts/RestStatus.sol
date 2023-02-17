/*
 * @see: https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 * @see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
contract RestStatus {
  uint constant OK = 200;
  uint constant CREATED = 201;
  uint constant ACCEPTED = 202;

  uint constant BAD_REQUEST = 400;
  uint constant UNAUTHORIZED = 401;
  uint constant FORBIDDEN = 403;
  uint constant NOT_FOUND = 404;
  uint constant CONFLICT = 409;

  uint constant INTERNAL_SERVER_ERROR = 500;
  uint constant NOT_IMPLEMENTED = 501;
  uint constant BAD_GATEWAY = 502;
  uint constant GATEWAY_TIMEOUT = 504;
}
