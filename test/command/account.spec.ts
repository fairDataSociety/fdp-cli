import { describeCommand, invokeTestCli } from '../utility'
import { createUsableBatch, getRandomString, topUpWallet } from '../utils'

describeCommand(
  'Test Account command',
  ({ consoleMessages, configFilePath }) => {
    beforeAll(async () => {
      await createUsableBatch()
    })

    it('should register portable FDP account', async () => {
      const username = getRandomString()
      const identity = getRandomString()
      const identityPassword = getRandomString()
      const accountPassword = getRandomString()

      await invokeTestCli(['account', 'create', identity, '--password', identityPassword])
      consoleMessages.length = 0
      await topUpWallet(configFilePath, identity)
      await invokeTestCli([
        'account',
        'register',
        username,
        '--identity',
        identity,
        '--password',
        identityPassword,
        '--account-password',
        accountPassword,
      ])
      expect(consoleMessages[0]).toContain('New account registered successfully!')
      expect(consoleMessages[1]).toContain('Username:')
      expect(consoleMessages[1]).toContain(`${username}`)
    })

    it('should fail during registration portable FDP account with insufficient balance', async () => {
      const username = getRandomString()
      const identity = getRandomString()
      const identityPassword = getRandomString()
      const accountPassword = getRandomString()

      await invokeTestCli(['account', 'create', identity, '--password', identityPassword])
      consoleMessages.length = 0
      await invokeTestCli([
        'account',
        'register',
        username,
        '--identity',
        identity,
        '--password',
        identityPassword,
        '--account-password',
        accountPassword,
      ])
      expect(consoleMessages[0]).toContain('Failed to register account: insufficient funds for gas * price + value')
    })

    it('should fail on incorrect username length', async () => {
      const shortUsername = getRandomString(3)
      const longUsername = getRandomString(83)
      const identityPassword = getRandomString()
      const accountPassword = getRandomString()

      await invokeTestCli(['account', 'create', 'test', '--password', identityPassword])
      consoleMessages.length = 0

      await invokeTestCli([
        'account',
        'register',
        shortUsername,
        '--identity',
        'test',
        '--password',
        identityPassword,
        '--account-password',
        accountPassword,
      ])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[username] must have length of at least 4 characters',
      )
      consoleMessages.length = 0

      await invokeTestCli([
        'account',
        'register',
        longUsername,
        '--identity',
        'test',
        '--password',
        identityPassword,
        '--account-password',
        accountPassword,
      ])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[username] must have length of at most 82 characters',
      )
    })

    it('should fail on incorrect password length', async () => {
      const identityName = getRandomString()
      const username = getRandomString()
      const password = getRandomString()
      const shortPassword = getRandomString(7)
      const longPassword = getRandomString(256)

      await invokeTestCli(['account', 'create', identityName, '--password', shortPassword])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[password] must have length of at least 8 characters',
      )
      consoleMessages.length = 0

      await invokeTestCli(['account', 'create', identityName, '--password', longPassword])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[password] must have length of at most 255 characters',
      )
      consoleMessages.length = 0

      await invokeTestCli(['account', 'create', identityName, '--password', password])
      consoleMessages.length = 0

      await invokeTestCli([
        'account',
        'register',
        username,
        '--identity',
        identityName,
        '--password',
        password,
        '--account-password',
        shortPassword,
      ])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[account-password] must have length of at least 8 characters',
      )
      consoleMessages.length = 0

      await invokeTestCli([
        'account',
        'register',
        username,
        '--identity',
        identityName,
        '--password',
        password,
        '--account-password',
        longPassword,
      ])
      expect(consoleMessages[consoleMessages.length - 1]).toContain(
        '[account-password] must have length of at most 255 characters',
      )
    })

    it('should import wallet from mnemonic', async () => {
      const username = getRandomString()
      const password = getRandomString()
      const mnemonic = 'color rely balcony exotic wrist order face uncle spell alien style ozone balance front fever'

      await invokeTestCli(['account', 'import', mnemonic, '--name', username, '--password', password])
      expect(consoleMessages[0]).toEqual(`Mnemonic imported as identity '${username}' successfully`)
    })
  },
  { configFileName: 'account' },
)
