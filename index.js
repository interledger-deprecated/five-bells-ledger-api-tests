'use strict'

const PluginBells = require('ilp-plugin-bells')
const joinUsername = (uri, name) => {
  return uri.match(/\/$/) ? (uri + name) : (uri + '/' + name)
}

const ilpPrefix = process.env.TEST_ILP_PREFIX
const accountUri = process.env.TEST_ACCOUNT_URI
const account1 = process.env.TEST_ACCOUNT_1
const account2 = process.env.TEST_ACCOUNT_2
const password1 = process.env.TEST_PASSWORD_1
const password2 = process.env.TEST_PASSWORD_2

if (!ilpPrefix || !accountUri || !account1 || !account2 || !password1 || !password2) {
  console.error('Missing environment variable(s): All of TEST_ILP_PREFIX, TEST_ACCOUNT_URI, TEST_ACCOUNT_1, TEST_ACCOUNT_2, TEST_PASSWORD_1, and TEST_PASSWORD_2 must be set.')
  process.exit(1)
}

exports.plugin = PluginBells
exports.timeout = 30000
exports.options = [
  {
    pluginOptions: {
      account: joinUsername(accountUri, account1),
      password: password1,
      prefix: ilpPrefix
    },
    transfer: {
      account: ilpPrefix + account2
    }
  },
  {
    pluginOptions: {
      account: joinUsername(accountUri, account2),
      password: password2,
      prefix: ilpPrefix
    },
    transfer: {
      account: ilpPrefix + account1
    }
  }
]
