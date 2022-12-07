import { describeCommand, invokeTestCli } from '../utility'
import { getRandomString } from '../utils'

describeCommand(
  'Test Main account command',
  ({ getLastMessage }) => {
    it('should set and get main account', async () => {
      const account1 = getRandomString()
      const account2 = getRandomString()
      const account3NotCreated = getRandomString()
      const accountPassword = getRandomString()
      await invokeTestCli(['account', 'create', account1, '--password', accountPassword])
      await invokeTestCli(['account', 'create', account2, '--password', accountPassword])

      // first created account should be the main
      await invokeTestCli(['account', 'main'])
      expect(getLastMessage()).toContain(`Current main account: ${account1}`)

      await invokeTestCli(['account', 'main', account2])
      expect(getLastMessage()).toContain(`New main account: ${account2}`)

      await invokeTestCli(['account', 'main'])
      expect(getLastMessage()).toContain(`Current main account: ${account2}`)

      await invokeTestCli(['account', 'main', account3NotCreated])
      expect(getLastMessage()).toContain(`No account found with the name '${account3NotCreated}'`)

      // check that main account has not been changed
      await invokeTestCli(['account', 'main'])
      expect(getLastMessage()).toContain(`Current main account: ${account2}`)

      await invokeTestCli(['account', 'remove', account1, '--yes'])

      await invokeTestCli(['account', 'main'])
      expect(getLastMessage()).toContain(`Current main account: ${account2}`)
    })
  },
  { configFileName: 'main-account' },
)
