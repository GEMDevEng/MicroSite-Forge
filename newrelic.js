/**
 * New Relic agent configuration (ESM)
 *
 * Converted to ESM export to satisfy ESLint and modern module tooling.
 */
const config = {
  // Array of application names.
  app_name: ['MicroSite Forge'],

  // Your New Relic license key.
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  logging: {
    // Log level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
    level: 'info',
  },

  // Capture headers except those listed below
  allow_all_headers: true,

  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.x*',
      'response.headers.setCookie*',
    ],
  },

  // Enable this to include process uptime in the app name.
  enable_process_uptiming: false,
}

export default config
