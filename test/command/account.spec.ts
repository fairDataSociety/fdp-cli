import { describeCommand, invokeTestCli } from '../utility'
import { assertBatchId, beeUrl, getEncryptedSeed, getRandomString, topUpAccount } from '../utils'
import { FdpStorage } from '@fairdatasociety/fdp-storage'
import { ZERO_BATCH_ID } from '../../src/utils/bee'
import { decryptSeedString } from '../../src/utils/encryption'
import { hdNodeFromSeed } from '../../src/utils/wallet'

describeCommand(
  'Test Account command',
  ({ consoleMessages, configFilePath }) => {
    it('should create account', async () => {
      const account = getRandomString()
      const account1 = getRandomString()
      const accountPassword = getRandomString()

      await invokeTestCli(['account', 'create', account, '--password', accountPassword])
      expect(consoleMessages[0]).toContain('Name:')
      expect(consoleMessages[0]).toContain(account)
      consoleMessages.length = 0

      // create with alias
      await invokeTestCli(['account', 'create', account1, '-P', accountPassword])
      expect(consoleMessages[0]).toContain('Name:')
      expect(consoleMessages[0]).toContain(account1)
      consoleMessages.length = 0
    })

    it('should register portable FDP account', async () => {
      const portableUsername = getRandomString()
      const account = getRandomString()
      const accountPassword = getRandomString()
      const portablePassword = getRandomString()

      await invokeTestCli(['account', 'create', account, '--password', accountPassword])
      consoleMessages.length = 0
      await topUpAccount(configFilePath, account, accountPassword)
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

    it('should register portable FDP account with aliases', async () => {
      const portableUsername = getRandomString()
      const account = getRandomString()
      const accountPassword = getRandomString()
      const portablePassword = getRandomString()

      await invokeTestCli(['account', 'create', account, '-P', accountPassword])
      consoleMessages.length = 0
      await topUpAccount(configFilePath, account, accountPassword)
      await invokeTestCli([
        'account',
        'register',
        portableUsername,
        '-a',
        account,
        '-P',
        accountPassword,
        '-p',
        portablePassword,
      ])
      expect(consoleMessages[0]).toContain('New account registered successfully!')
      expect(consoleMessages[1]).toContain('Username:')
      expect(consoleMessages[1]).toContain(`${portableUsername}`)

      // comparing stored cli account address with fdp portable account address
      assertBatchId(ZERO_BATCH_ID)
      const fdp = new FdpStorage(beeUrl(), ZERO_BATCH_ID)
      await fdp.account.login(portableUsername, portablePassword)
      const encryptedSeed = await getEncryptedSeed(configFilePath, account)
      const decryptedSeed = decryptSeedString(encryptedSeed, accountPassword)
      const hdNode = hdNodeFromSeed(decryptedSeed)
      expect(fdp.account.wallet?.address).toEqual(hdNode.address)
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
      const account = getRandomString()
      const password = getRandomString()
      const mnemonic = 'color rely balcony exotic wrist order face uncle spell alien style ozone balance front fever'

      await invokeTestCli(['account', 'import', mnemonic, '--name', account, '--password', password])
      expect(consoleMessages[0]).toEqual(`Mnemonic imported as account '${account}' successfully`)
    })

    it('should remove imported wallet', async () => {
      const account = getRandomString()
      const password = getRandomString()
      const mnemonic = 'color rely balcony exotic wrist order face uncle spell alien style ozone balance front fever'

      await invokeTestCli(['account', 'import', mnemonic, '--name', account, '--password', password])
      expect(consoleMessages[0]).toEqual(`Mnemonic imported as account '${account}' successfully`)
      consoleMessages.length = 0

      await invokeTestCli(['account', 'remove', account, '--yes'])
      expect(consoleMessages[0]).toEqual(`Account '${account}' has been successfully deleted`)
    })

    it('should login with portable FDP account', async () => {
      const portableUsername = getRandomString()
      const account = getRandomString()
      const accountPassword = getRandomString()
      const newAccountPassword = getRandomString()
      const portablePassword = getRandomString()

      await invokeTestCli(['account', 'create', account, '--password', accountPassword])
      consoleMessages.length = 0
      await topUpAccount(configFilePath, account, accountPassword)
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

      await invokeTestCli(['account', 'remove', portableUsername, '--yes'])
      consoleMessages.length = 0

      // login with aliases
      await invokeTestCli(['account', 'login', portableUsername, '-p', portablePassword, '-P', newAccountPassword])
      expect(consoleMessages[0]).toContain('Logged in successfully!')
    })
  },
  { configFileName: 'account' },
)
