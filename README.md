# Five Bells Ledger API Tests

> Use plugin bells and ILP plugin tests against a live ledger instance.

## Installation

Run `npm install` to install dependencies.

## Usage

In order to run on a live ledger instance, you'll need two accounts.
These are set through environment variables.

```sh
TEST_ILP_PREFIX='us.usd.red.' \
TEST_ACCOUNT_URI='https://red.ilpdemo.org/ledger/accounts/' \
TEST_ACCOUNT_1='testaccount1' \
TEST_ACCOUNT_2='testaccount2' \
TEST_PASSWORD_1='ZMuRzTnZOsKZw' \
TEST_PASSWORD_2='JTIONvYoc6+sQ' \
TEST_ADMIN_ACCOUNT='admin' \
TEST_ADMIN_PASSWORD='iodgm4yuAGB' \
  npm test
```

These must be credentials to valid accounts on your ledger. Furthermore, both
of these accounts should hold plenty of currency. If tests fail with the error
`NotAcceptedError: Sender has insufficient funds.`, then that means one has run
out. Because these tests are run against a live ledger, you will have to
manually fund these accounts.
