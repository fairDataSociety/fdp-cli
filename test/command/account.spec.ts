import { describeCommand, invokeTestCli } from '../utility'
import { createUsableBatch, getRandomString, topUpWallet } from '../utils'

describeCommand(
  'Test Account command',
  ({ consoleMessages, configFilePath }) => {
    beforeAll(async () => {
      await createUsableBatch()
    })

    it('should register portable FDP account', async () => {
      const portableUsername = getRandomString()
      const account = getRandomString()
      const accountPassword = getRandomString()
      const portablePassword = getRandomString()

      await invokeTestCli(['account', 'create', account, '--password', accountPassword])
      consoleMessages.length = 0
      await topUpWallet(configFilePath, account)
      await invokeTestCli([
        'account',
        'register',
        portableUsername,
        '--account',
        account,
        '--password',
        accountPassword,
        '--portable-password',
        portablePassword,
      ])
      expect(consoleMessages[0]).toContain('New account registered successfully!')
      expect(consoleMessages[1]).toContain('Username:')
      expect(consoleMessages[1]).toContain(`${portableUsername}`)
    })

    it('should fail during registration portable FDP account with insufficient balance', async () => {
      const portableUsername = getRandomString()
      const account = getRandomString()
      const accountPassword = getRandomString()
      const portablePassword = getRandomString()

      await invokeTestCli(['account', 'create', account, '--password', accountPassword])
      consoleMessages.length = 0
      await invokeTestCli([
        'account',
        'register',
        portableUsername,
        '--account',
        account,
        '--password',
        accountPassword,
        '--portable-password',
        portablePassword,
      ])
      expect(consoleMessages[0]).toContain('Failed to register account: insufficient funds for gas * price + value')
    })

    it('should fail on incorrect username length', async () => {
      const shortUsername = getRandomString(3)
      const longUsername = getRandomString(83)
      const accountPassword = getRandomString()
      const portablePassword = getRandomString()

      await invokeTestCli(['account', 'create', 'test', '--password', accountPassword])
      consoleMessages.length = 0

      await invokeTestCli([
        'account',
        'register',
        shortUsername,
        '--account',
        'test',
        '--password',
        accountPassword,
        '--portable-password',
        portablePassword,
      ])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[username] must have length of at least 4 characters',
      )
      consoleMessages.length = 0

      await invokeTestCli([
        'account',
        'register',
        longUsername,
        '--account',
        'test',
        '--password',
        accountPassword,
        '--portable-password',
        portablePassword,
      ])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[username] must have length of at most 82 characters',
      )
    })

    it('should fail on incorrect password length', async () => {
      const accountName = getRandomString()
      const username = getRandomString()
      const password = getRandomString()
      const shortPortablePassword = getRandomString(7)
      const longPortablePassword = getRandomString(256)

      await invokeTestCli(['account', 'create', accountName, '--password', shortPortablePassword])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[password] must have length of at least 8 characters',
      )
      consoleMessages.length = 0

      await invokeTestCli(['account', 'create', accountName, '--password', longPortablePassword])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[password] must have length of at most 255 characters',
      )
      consoleMessages.length = 0

      await invokeTestCli(['account', 'create', accountName, '--password', password])
      consoleMessages.length = 0

      await invokeTestCli([
        'account',
        'register',
        username,
        '--account',
        accountName,
        '--password',
        password,
        '--portable-password',
        shortPortablePassword,
      ])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[portable-password] must have length of at least 8 characters',
      )
      consoleMessages.length = 0

      await invokeTestCli([
        'account',
        'register',
        username,
        '--account',
        accountName,
        '--password',
        password,
        '--portable-password',
        longPortablePassword,
      ])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[portable-password] must have length of at most 255 characters',
      )
    })

    it('should import wallet from mnemonic', async () => {
      const username = getRandomString()
      const password = getRandomString()
      const mnemonic = 'color rely balcony exotic wrist order face uncle spell alien style ozone balance front fever'

      await invokeTestCli(['account', 'import', mnemonic, '--name', username, '--password', password])
      expect(consoleMessages[0]).toEqual(`Mnemonic imported as account '${username}' successfully`)
    })

    it('should login with portable FDP account', async () => {
      const portableUsername = getRandomString()
      const account = getRandomString()
      const accountPassword = getRandomString()
      const newAccountPassword = getRandomString()
      const portablePassword = getRandomString()

      await invokeTestCli(['account', 'create', account, '--password', accountPassword])
      consoleMessages.length = 0
      await topUpWallet(configFilePath, account)
      await invokeTestCli([
        'account',
        'register',
        portableUsername,
        '--account',
        account,
        '--password',
        accountPassword,
        '--portable-password',
        portablePassword,
      ])
      expect(consoleMessages[0]).toContain('New account registered successfully!')
      expect(consoleMessages[1]).toContain('Username:')
      expect(consoleMessages[1]).toContain(`${portableUsername}`)
      consoleMessages.length = 0

      await invokeTestCli([
        'account',
        'login',
        portableUsername,
        '--portable-password',
        portablePassword,
        '--password',
        newAccountPassword,
      ])
      expect(consoleMessages[0]).toContain('Logged in successfully!')
    })
  },
  { configFileName: 'account' },
)
