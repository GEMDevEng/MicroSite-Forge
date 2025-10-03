'use strict'
/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['MicroSite Forge'],
  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with your instrumentation. The levels in order, from least verbose to most
     * verbose are 'fatal', 'error', 'warn', 'info', 'debug', 'trace'.
     */
    level: 'info'
  },
  /**
   * When true, all request headers except for a deny list will be captured for the current application.
   */
  allow_all_headers: true,
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.x*',
      'response.headers.setCookie*'
    ]
  },
  /**
   * Enable this to include process uptime in the app name.
   */
  enable_process_uptiming: false
}
