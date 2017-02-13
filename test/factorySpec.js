'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

const joinUsername = (uri, name) => {
  return uri.match(/\/$/) ? (uri + name) : (uri + '/' + name)
}

const assert = chai.assert
const PluginBellsFactory = require('ilp-plugin-bells').Factory
const uuid = require('uuid4')

const prefix = process.env.TEST_ILP_PREFIX
const accountUri = process.env.TEST_ACCOUNT_URI
const adminUser = process.env.TEST_ADMIN_ACCOUNT
const adminPass = process.env.TEST_ADMIN_PASSWORD
const user1 = process.env.TEST_ACCOUNT_1
const user2 = process.env.TEST_ACCOUNT_2

if (!prefix || !accountUri || !adminUser || !adminPass || !user1 || !user2) {
  console.error('TEST_ILP_PREFIX, TEST_ACCOUNT_URI, TEST_ADMIN_ACCOUNT, TEST_ADMIN_PASS, TEST_ACCOUNT_1, and TEST_ACCOUNT_2 must be set.')
  process.exit(1)
}

describe('PluginBellsFactory', function () {
  beforeEach(function * () {

    this.transfer = {
      id: uuid(),
      account: prefix + user2,
      amount: '1',
      expiresAt: (new Date((new Date()).getTime() + 10000)).toISOString()
    }

    this.message = {
      ledger: prefix,
      account: prefix + user2,
      data: {foo: 'bar'}
    }

    this.factory = new PluginBellsFactory({
      adminUsername: adminUser,
      adminPassword: adminPass,
      adminAccount: joinUsername(accountUri, adminUser),
      prefix: prefix
    })

    yield this.factory.connect()
    assert.isTrue(this.factory.isConnected())

    this.plugin1 = yield this.factory.create({ username: user1 })
    this.plugin2 = yield this.factory.create({ username: user2 })
    assert.isOk(this.factory.plugins.get(user1))
    assert.isOk(this.factory.plugins.get(user2))
  })

  afterEach(function * () {
    if (this.factory.isConnected()) {
      yield this.factory.disconnect()
    }
  })

  describe('connect', function () {
    it('will not connect twice', function * () {
      yield this.factory.connect()
      assert.isTrue(this.factory.isConnected())
    })

    it('disconnects', function * () {
      yield this.factory.disconnect()
      assert.isFalse(this.factory.isConnected())
    })

    it('will pass a notification to the correct plugin', function * () {
      const id = uuid()
      const handled = new Promise((resolve, reject) => {
        this.plugin2.on('incoming_transfer', (transfer) => {
          if (transfer.id === this.transfer.id) {
            resolve()
          }
        })
      })

      yield this.plugin1.sendTransfer(this.transfer)
      yield handled
    })

    it('will pass a message to the correct plugin', function * () {
      const id = uuid()
      const handled = new Promise((resolve, reject) => {
        this.plugin2.on('incoming_message', (message) => {
          if (message.id === this.message.id) {
            if (message.account !== prefix + user1 &&
                message.from !== prefix + user1) {
              reject(new Error(
                'neither message.account (' + message.account + 
                ') nor message.from (' + message.from +
                ') equals sender: ' + prefix + user1))
            }
            resolve()
          }
        })
      })

      yield this.plugin1.sendMessage(this.message)
      yield handled
    })
  })

  describe('create', function () {
    it('will not create a nonexistant account', function * () {
      try {
        // we can safely assume that there is no username matching a random uuid
        yield this.factory.create({ username: uuid() })
        assert(false, 'factory create should have failed')
      } catch (e) {
        assert.isTrue(true)
      }
    })

    it('will create a plugin', function * () {
      assert.isObject(this.plugin1)
      assert.isTrue(this.plugin1.isConnected())

      const plugin = yield this.factory.create({ username: user1 })
      assert.equal(this.plugin1, plugin, 'only one plugin should be made per account')
    })

    /*
    it('subscribes to the new account', function (done) {

      this.wsRedLedger.on('message', (rpcMessageString) => {
        const rpcMessage = JSON.parse(rpcMessageString)
        assert.deepEqual(rpcMessage, {
          jsonrpc: '2.0',
          id: 3,
          method: 'subscribe_account',
          params: {
            eventType: '*',
            accounts: ['http://red.example/accounts/mike', 'http://red.example/accounts/mary']
          }
        })
        done()
      })
      this.factory.create({ username: 'mary' }).catch(done)
    })
    */

    /*
    it('will throw if given an invalid opts.username', function (done) {
      this.factory.create({ username: 'foo!' }).catch((err) => {
        assert.equal(err.message, 'Invalid opts.username')
        done()
      })
    })
    */
  })

  describe('remove', function () {
    it('removes a plugin', function * () {
      yield this.factory.remove(user1)
      assert.isNotOk(this.factory.plugins.get(user1))
    })
  })
})
