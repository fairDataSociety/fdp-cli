import { describeCommand, invokeTestCli } from '../utility'
import { getRandomString } from '../utils'
import { createFdpAndImport } from '../utility/fdp'

describeCommand(
  'Test Main account command',
  ({ consoleMessages, getLastMessage }) => {
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

      await invokeTestCli(['account', 'remove', account2, '--yes'])
      await invokeTestCli(['account', 'main'])
      expect(getLastMessage()).toContain('Main account is not defined')
    })

    it('should be used set main account for commands', async () => {
      const podName1 = getRandomString()
      const directoryName1 = 'hello-world'
      const directoryToCreate = `/${directoryName1}`

      const fdpData1 = await createFdpAndImport()
      const fdpData2 = await createFdpAndImport()
      const accountPassword2 = fdpData2.accountPassword
      await invokeTestCli(['account', 'main', fdpData2.account])
      expect(getLastMessage()).toContain(`New main account: ${fdpData2.account}`)

      await invokeTestCli(['pod', 'create', podName1, '--password', accountPassword2])
      await invokeTestCli(['directory', 'create', directoryToCreate, '--pod', podName1, '--password', accountPassword2])
      consoleMessages.length = 0
      await invokeTestCli(['directory', 'read', '/', '--pod', podName1, '--password', accountPassword2])
      expect(consoleMessages[0]).toContain(directoryName1)

      // actions should not be made with first account
      fdpData1.fdp.account.setAccountFromMnemonic(fdpData1.wallet.mnemonic.phrase)
      const podsList0 = await fdpData1.fdp.personalStorage.list()
      expect(podsList0.getPods()).toHaveLength(0)
      expect(podsList0.getSharedPods()).toHaveLength(0)

      // actions should be made with second account
      fdpData2.fdp.account.setAccountFromMnemonic(fdpData2.wallet.mnemonic.phrase)
      const podsList1 = await fdpData2.fdp.personalStorage.list()
      expect(podsList1.getPods()).toHaveLength(1)
      expect(podsList1.getSharedPods()).toHaveLength(0)

      const directories1 = await fdpData2.fdp.directory.read(podName1, '/')
      expect(directories1.getDirectories()).toHaveLength(1)
      expect(directories1.getDirectories()[0].name).toEqual(directoryName1)
    })
  },
  { configFileName: 'main-account' },
)
