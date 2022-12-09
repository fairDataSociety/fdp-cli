import { describeCommand, invokeTestCli } from '../utility'
import { getRandomString, getTestFilePath } from '../utils'
import { createFdpAndImport } from '../utility/fdp'

describeCommand(
  'Test main pod command',
  ({ consoleMessages, getLastMessage }) => {
    it('should set and get main pod', async () => {
      const { accountPassword } = await createFdpAndImport({
        forceSetAsMain: true,
      })
      const podName1 = getRandomString()
      const podName2 = getRandomString()
      const podNameNotFound = getRandomString()

      await invokeTestCli(['pod', 'main', '--password', accountPassword])
      expect(getLastMessage()).toEqual('Main pod is not defined')

      // first create pod will be the main pod
      await invokeTestCli(['pod', 'create', podName1, '--password', accountPassword])
      await invokeTestCli(['pod', 'create', podName2, '--password', accountPassword])
      await invokeTestCli(['pod', 'main', '--password', accountPassword])
      expect(getLastMessage()).toContain(`Current main pod: ${podName1}`)

      // check that main pod changeable
      await invokeTestCli(['pod', 'main', podName2, '--password', accountPassword])
      expect(getLastMessage()).toContain(`New main pod: ${podName2}`)
      await invokeTestCli(['pod', 'main', '--password', accountPassword])
      expect(getLastMessage()).toContain(`Current main pod: ${podName2}`)

      // check that deleting other pods doesn't affect main pod
      await invokeTestCli(['pod', 'delete', podName1, '--password', accountPassword, '-f'])
      await invokeTestCli(['pod', 'main', '--password', accountPassword])
      expect(getLastMessage()).toContain(`Current main pod: ${podName2}`)

      // deleting main pod should trigger removing of main pod from config
      await invokeTestCli(['pod', 'delete', '--password', accountPassword, '-f'])
      await invokeTestCli(['pod', 'main', '--password', accountPassword])
      expect(getLastMessage()).toContain('Main pod is not defined')

      // pod that doesn't exist can't be set as main
      await invokeTestCli(['pod', 'main', podNameNotFound, '--password', accountPassword])
      expect(getLastMessage()).toContain(`Pod not found: ${podNameNotFound}`)
    })

    it('should be used set main account and main pod for directories', async () => {
      const { fdp, wallet, accountPassword } = await createFdpAndImport({
        forceSetAsMain: true,
      })
      const podName1 = getRandomString()
      const directoryName1 = 'hello-world'
      const directoryName2 = 'vitalik-nakamoto'
      const fullDirectoryName1 = `/${directoryName1}`
      const fullDirectoryName2 = `/${directoryName2}`
      fdp.account.setAccountFromMnemonic(wallet.mnemonic.phrase)

      await invokeTestCli(['pod', 'create', podName1, '--password', accountPassword])
      consoleMessages.length = 0

      await invokeTestCli(['directory', 'create', fullDirectoryName1, '--password', accountPassword])
      expect(consoleMessages[0]).toContain('Directory created successfully!')
      consoleMessages.length = 0

      await invokeTestCli(['directory', 'create', fullDirectoryName2, '--password', accountPassword])
      expect(consoleMessages[0]).toContain('Directory created successfully!')
      consoleMessages.length = 0

      await invokeTestCli(['directory', 'read', '/', '--password', accountPassword])
      expect(consoleMessages[0]).toContain(directoryName1)
      consoleMessages.length = 0

      const directories1 = await fdp.directory.read(podName1, '/')
      expect(directories1.getDirectories()).toHaveLength(2)
      expect(directories1.getDirectories().find(item => item.name === directoryName1)).toBeDefined()
      expect(directories1.getDirectories().find(item => item.name === directoryName2)).toBeDefined()

      await invokeTestCli(['directory', 'delete', fullDirectoryName1, '--password', accountPassword])
      const directories2 = await fdp.directory.read(podName1, '/')
      expect(directories2.getDirectories()).toHaveLength(1)
      expect(directories2.getDirectories().find(item => item.name === directoryName2)).toBeDefined()
    })

    it('should be used set main account and main pod for files', async () => {
      const { fdp, wallet, accountPassword } = await createFdpAndImport({
        forceSetAsMain: true,
      })
      const podName1 = getRandomString()
      const directoryName1 = 'vitalik-nakamoto'
      const fullDirectoryName1 = `/${directoryName1}`
      const fileSource1 = getTestFilePath('file1.bin')
      const fileName1 = `${getRandomString()}.bin`
      const fullFilePath1 = `/${fileName1}`
      fdp.account.setAccountFromMnemonic(wallet.mnemonic.phrase)

      // create pod and directory for file uploading
      await invokeTestCli(['pod', 'create', podName1, '--password', accountPassword])
      await invokeTestCli(['directory', 'create', fullDirectoryName1, '--password', accountPassword])
      consoleMessages.length = 0

      // file should be uploaded without passing account name and pod name
      await invokeTestCli(['file', 'upload', fileSource1, fullFilePath1, '--password', accountPassword])
      expect(getLastMessage()).toContain('uploaded successfully to')
      expect(getLastMessage()).toContain(fullFilePath1)
      const result1 = await fdp.directory.read(podName1, '/')
      expect(result1.getFiles()).toHaveLength(1)
      expect(result1.getFiles()[0].name).toEqual(fileName1)

      // file should be deleted without passing account name and pod name
      await invokeTestCli(['file', 'delete', fullFilePath1, '--password', accountPassword])
      expect(getLastMessage()).toContain(`deleted successfully!`)
      expect(getLastMessage()).toContain(fullFilePath1)
      const result2 = await fdp.directory.read(podName1, '/')
      expect(result2.getFiles()).toHaveLength(0)
    })
  },
  { configFileName: 'main-pod' },
)
