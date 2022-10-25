import { describeCommand, invokeTestCli } from '../utility'
import { createFdp, getRandomString } from '../utils'

describeCommand(
  'Test Pod command',
  ({ consoleMessages }) => {
    it('should list pods', async () => {
      const account = getRandomString()
      const accountPassword = getRandomString()
      const podName1 = getRandomString()
      const podName2 = getRandomString()
      const fdp = createFdp()

      const wallet = fdp.account.createWallet()
      await fdp.personalStorage.create(podName1)
      await fdp.personalStorage.create(podName2)

      await invokeTestCli([
        'account',
        'import',
        wallet.mnemonic.phrase,
        '--name',
        account,
        '--password',
        accountPassword,
      ])
      consoleMessages.length = 0

      await invokeTestCli(['pod', 'list', '--account', account, '--password', accountPassword])
      expect(consoleMessages[0]).toContain('Name:')
      expect(consoleMessages[0]).toContain(podName1)
      expect(consoleMessages[2]).toContain('Name:')
      expect(consoleMessages[2]).toContain(podName2)
    })

    it('should create pods', async () => {
      const account = getRandomString()
      const accountPassword = getRandomString()
      const podName1 = getRandomString()
      const podName2 = getRandomString()
      const fdp = createFdp()

      const wallet = fdp.account.createWallet()
      await invokeTestCli([
        'account',
        'import',
        wallet.mnemonic.phrase,
        '--name',
        account,
        '--password',
        accountPassword,
      ])
      consoleMessages.length = 0

      await invokeTestCli(['pod', 'create', podName1, '--account', account, '--password', accountPassword])
      expect(consoleMessages[0]).toContain('Pod created successfully!')
      consoleMessages.length = 0

      await invokeTestCli(['pod', 'create', podName2, '--account', account, '--password', accountPassword])
      expect(consoleMessages[0]).toContain('Pod created successfully!')
      consoleMessages.length = 0

      await invokeTestCli(['pod', 'list', '--account', account, '--password', accountPassword])
      expect(consoleMessages[0]).toContain('Name:')
      expect(consoleMessages[0]).toContain(podName1)
      expect(consoleMessages[2]).toContain('Name:')
      expect(consoleMessages[2]).toContain(podName2)

      const pods1 = (await fdp.personalStorage.list()).getPods()
      expect(pods1).toHaveLength(2)
      expect(pods1.find(item => item.name === podName1)).toBeDefined()
      expect(pods1.find(item => item.name === podName2)).toBeDefined()
    })

    it('should delete pods', async () => {
      const account = getRandomString()
      const accountPassword = getRandomString()
      const podName1 = getRandomString()
      const podName2 = getRandomString()
      const fdp = createFdp()

      const wallet = fdp.account.createWallet()
      await invokeTestCli([
        'account',
        'import',
        wallet.mnemonic.phrase,
        '--name',
        account,
        '--password',
        accountPassword,
      ])
      consoleMessages.length = 0

      await invokeTestCli(['pod', 'create', podName1, '--account', account, '--password', accountPassword])
      await invokeTestCli(['pod', 'create', podName2, '--account', account, '--password', accountPassword])
      consoleMessages.length = 0

      await invokeTestCli(['pod', 'delete', podName1, '--account', account, '--password', accountPassword])
      expect(consoleMessages[0]).toContain('Pod deleted successfully!')
      consoleMessages.length = 0

      await invokeTestCli(['pod', 'list', '--account', account, '--password', accountPassword])
      expect(consoleMessages[0]).toContain('Name:')
      expect(consoleMessages[0]).toContain(podName2)

      const pods1 = (await fdp.personalStorage.list()).getPods()
      expect(pods1).toHaveLength(1)
      expect(pods1.find(item => item.name === podName1)).toBeUndefined()
      expect(pods1.find(item => item.name === podName2)).toBeDefined()
    })
  },
  { configFileName: 'pod' },
)
