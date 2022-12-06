import { describeCommand, invokeTestCli } from '../utility'
import { getRandomString } from '../utils'

describeCommand(
  'Test Main account command',
  ({ consoleMessages }) => {
    it('should set and get main account', async () => {
      const account1 = getRandomString()
      const account2 = getRandomString()
      const account3NotCreated = getRandomString()
      const accountPassword = getRandomString()
      await invokeTestCli(['account', 'create', account1, '--password', accountPassword])
      await invokeTestCli(['account', 'create', account2, '--password', accountPassword])
      consoleMessages.length = 0

      // first created account should be the main
      await invokeTestCli(['account', 'main'])
      expect(consoleMessages[0]).toContain(`Current main account: ${account1}`)
      consoleMessages.length = 0

      await invokeTestCli(['account', 'main', account2])
      expect(consoleMessages[0]).toContain(`New main account: ${account2}`)
      consoleMessages.length = 0

      await invokeTestCli(['account', 'main'])
      expect(consoleMessages[0]).toContain(`Current main account: ${account2}`)
      consoleMessages.length = 0

      await invokeTestCli(['account', 'main', account3NotCreated])
      expect(consoleMessages[0]).toContain(`No account found with the name '${account3NotCreated}'`)
      consoleMessages.length = 0

      // check that main account has not been changed
      await invokeTestCli(['account', 'main'])
      expect(consoleMessages[0]).toContain(`Current main account: ${account2}`)
      consoleMessages.length = 0

      await invokeTestCli(['account', 'remove', account1, '--yes'])
      consoleMessages.length = 0

      await invokeTestCli(['account', 'main'])
      expect(consoleMessages[0]).toContain('Main account is not defined')
      consoleMessages.length = 0
    })
  },
  { configFileName: 'main-account' },
)
