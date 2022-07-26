import { describeCommand, invokeTestCli } from '../utility'
import { createUsableBatch, getRandomString, topUpWallet } from '../utils'

describeCommand(
  'Test Account command',
  ({ consoleMessages, configFilePath }) => {
    beforeAll(async () => {
      await createUsableBatch()
    })

    it('should register FDP account', async () => {
      const username = getRandomString()
      const password = getRandomString()

      await invokeTestCli(['identity', 'create', 'test', '--password', 'test'])
      consoleMessages.length = 0
      await topUpWallet(configFilePath, 'test')
      await invokeTestCli(['account', 'register', username, password, '--identity', 'test', '--password', 'test'])
      expect(consoleMessages[0]).toContain(`Username:`)
      expect(consoleMessages[0]).toContain(`${username}`)
    })
  },
  { configFileName: 'account' },
)
