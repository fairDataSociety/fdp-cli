import { describeCommand, invokeTestCli } from '../utility'
import { getRandomString } from '../utils'
import { createFdpAndImport } from '../utility/fdp'

describeCommand(
  'Test Pod command',
  ({ consoleMessages }) => {
    it('should list pods', async () => {
      const podName1 = getRandomString()
      const podName2 = getRandomString()
      const { fdp, account, accountPassword } = await createFdpAndImport()

      await fdp.personalStorage.create(podName1)
      await fdp.personalStorage.create(podName2)
      consoleMessages.length = 0

      await invokeTestCli(['pod', 'list', '--account', account, '--password', accountPassword])
      expect(consoleMessages[0]).toContain('Name:')
      expect(consoleMessages[0]).toContain(podName1)
      expect(consoleMessages[1]).toContain('Type:')
      expect(consoleMessages[1]).toContain('pod')
      expect(consoleMessages[3]).toContain('Name:')
      expect(consoleMessages[3]).toContain(podName2)
      expect(consoleMessages[4]).toContain('Type:')
      expect(consoleMessages[4]).toContain('pod')
    })

    it('should create pods', async () => {
      const podName1 = getRandomString()
      const podName2 = getRandomString()
      const { fdp, account, accountPassword } = await createFdpAndImport()

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
      expect(consoleMessages[1]).toContain('Type:')
      expect(consoleMessages[1]).toContain('pod')
      expect(consoleMessages[3]).toContain('Name:')
      expect(consoleMessages[3]).toContain(podName2)
      expect(consoleMessages[4]).toContain('Type:')
      expect(consoleMessages[4]).toContain('pod')

      const pods1 = (await fdp.personalStorage.list()).getPods()
      expect(pods1).toHaveLength(2)
      expect(pods1.find(item => item.name === podName1)).toBeDefined()
      expect(pods1.find(item => item.name === podName2)).toBeDefined()
    })

    it('should delete pods', async () => {
      const podName1 = getRandomString()
      const podName2 = getRandomString()
      const { fdp, account, accountPassword } = await createFdpAndImport()

      await invokeTestCli(['pod', 'create', podName1, '--account', account, '--password', accountPassword])
      await invokeTestCli(['pod', 'create', podName2, '--account', account, '--password', accountPassword])
      consoleMessages.length = 0

      await invokeTestCli(['pod', 'delete', podName1, '--account', account, '--password', accountPassword, '-f'])
      expect(consoleMessages[0]).toContain('Pod deleted successfully!')
      consoleMessages.length = 0

      await invokeTestCli(['pod', 'list', '--account', account, '--password', accountPassword])
      expect(consoleMessages[0]).toContain('Name:')
      expect(consoleMessages[0]).toContain(podName2)
      expect(consoleMessages[1]).toContain('Type:')
      expect(consoleMessages[1]).toContain('pod')

      const pods1 = (await fdp.personalStorage.list()).getPods()
      expect(pods1).toHaveLength(1)
      expect(pods1.find(item => item.name === podName1)).toBeUndefined()
      expect(pods1.find(item => item.name === podName2)).toBeDefined()
    })
  },
  { configFileName: 'pod' },
)
