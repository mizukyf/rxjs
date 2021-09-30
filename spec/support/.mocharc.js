module.exports = {
  require: ['ts-node/register', 'spec/support/mocha-path-mappings.js', 'spec/helpers/polyfills.ts', 'spec/helpers/testScheduler-ui.ts'],
  ui: ['spec/helpers/testScheduler-ui.ts'],
  reporter: 'dot',
  extensions: ['ts', 'js'],
  timeout: 5000,
  recursive: true,
  'enable-source-maps': true,
  'expose-gc': true,
  // Uncomment this to find all skipped tests.
  // forbidPending: true
};
