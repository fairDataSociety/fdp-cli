import { describeCommand, invokeTestCli } from '../utility'
import { createUsableBatch, getRandomString, topUpWallet } from '../utils'

describeCommand(
  'Test Account command',
  ({ consoleMessages, configFilePath }) => {
    beforeAll(async () => {
      await createUsableBatch()
    })

    it('should register FDP account with ENS', async () => {
      const username = getRandomString()
      const password = getRandomString()

      await invokeTestCli(['identity', 'create', 'test', '--password', password])
      consoleMessages.length = 0
      await topUpWallet(configFilePath, 'test')
      await invokeTestCli(['account', 'register', username, '--identity', 'test', '--password', password])
      expect(consoleMessages[0]).toContain(`Username:`)
      expect(consoleMessages[0]).toContain(`${username}`)
    })

    it('should import wallet from mnemonic', async () => {
      const username = getRandomString()
      const password = getRandomString()
      const mnemonic = 'color rely balcony exotic wrist order face uncle spell alien style ozone balance front fever'

      await invokeTestCli(['identity', 'import', mnemonic, '--name', username, '--password', password])
      expect(consoleMessages[0]).toEqual(`Mnemonic imported as identity '${username}' successfully`)
    })
  },
  { configFileName: 'account' },
)
