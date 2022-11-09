import { describeCommand, invokeTestCli } from '../utility'
import { createFdp, getRandomString, topUpAddress } from '../utils'
import { createFdpAndImport } from '../utility/fdp'

describeCommand(
  'Test Directory command',
  ({ consoleMessages }) => {
    it('should read directories list', async () => {
      const podName1 = getRandomString()
      const directory1 = getRandomString()
      const directory1Full = `/${directory1}`
      const directory2 = getRandomString()
      const directory2Full = `/${directory2}`
      const subDirectory1 = getRandomString()
      const subDirectory2 = getRandomString()
      const subDirectory1Full = `${directory1Full}/${subDirectory1}`
      const subDirectory2Full = `${directory1Full}/${subDirectory2}`
      const { fdp, account, accountPassword } = await createFdpAndImport()
      consoleMessages.length = 0

      await fdp.personalStorage.create(podName1)
      await fdp.directory.create(podName1, directory1Full)
      await fdp.directory.create(podName1, directory2Full)
      await fdp.directory.create(podName1, subDirectory1Full)
      await fdp.directory.create(podName1, subDirectory2Full)

      await invokeTestCli([
        'directory',
        'read',
        '/',
        '--pod',
        podName1,
        '--account',
        account,
        '--password',
        accountPassword,
      ])
      expect(consoleMessages[0]).toContain('Name:')
      expect(consoleMessages[0]).toContain(directory1)
      expect(consoleMessages[1]).toContain('Type')
      expect(consoleMessages[1]).toContain('directory')
      expect(consoleMessages[3]).toContain('Name:')
      expect(consoleMessages[3]).toContain(directory2)
      expect(consoleMessages[4]).toContain('Type')
      expect(consoleMessages[4]).toContain('directory')
      consoleMessages.length = 0

      await invokeTestCli([
        'directory',
        'read',
        directory1Full,
        '--pod',
        podName1,
        '--account',
        account,
        '--password',
        accountPassword,
      ])
      expect(consoleMessages[0]).toContain('Name:')
      expect(consoleMessages[0]).toContain(subDirectory1)
      expect(consoleMessages[1]).toContain('Type')
      expect(consoleMessages[1]).toContain('directory')
      expect(consoleMessages[3]).toContain('Name:')
      expect(consoleMessages[3]).toContain(subDirectory2)
      expect(consoleMessages[4]).toContain('Type')
      expect(consoleMessages[4]).toContain('directory')
    })

    it('should create directories', async () => {
      const podName1 = getRandomString()
      const directory1 = getRandomString()
      const directory1Full = `/${directory1}`
      const directory2 = getRandomString()
      const directory2Full = `/${directory2}`
      const subDirectory1 = getRandomString()
      const subDirectory2 = getRandomString()
      const subDirectory1Full = `${directory1Full}/${subDirectory1}`
      const subDirectory2Full = `${directory1Full}/${subDirectory2}`
      const { fdp, account, accountPassword } = await createFdpAndImport()
      consoleMessages.length = 0

      await fdp.personalStorage.create(podName1)

      for (const directoryToCreate of [directory1Full, directory2Full, subDirectory1Full, subDirectory2Full]) {
        await invokeTestCli([
          'directory',
          'create',
          directoryToCreate,
          '--pod',
          podName1,
          '--account',
          account,
          '--password',
          accountPassword,
        ])

        expect(consoleMessages[0]).toContain('Directory created successfully!')
        expect(consoleMessages[1]).toContain('Name:')
        expect(consoleMessages[1]).toContain(directoryToCreate)
        consoleMessages.length = 0
      }

      const directories1 = (await fdp.directory.read(podName1, '/', true)).getDirectories()
      expect(directories1).toHaveLength(2)
      expect(directories1[0].name).toEqual(directory1)
      expect(directories1[1].name).toEqual(directory2)
      const subDirectories1 = directories1[0].getDirectories()
      expect(subDirectories1).toHaveLength(2)
      expect(subDirectories1[0].name).toEqual(subDirectory1)
      expect(subDirectories1[1].name).toEqual(subDirectory2)
    })

    it('should delete directories', async () => {
      const podName1 = getRandomString()
      const directory1 = getRandomString()
      const directory1Full = `/${directory1}`
      const directory2 = getRandomString()
      const directory2Full = `/${directory2}`
      const subDirectory1 = getRandomString()
      const subDirectory2 = getRandomString()
      const subDirectory1Full = `${directory1Full}/${subDirectory1}`
      const subDirectory2Full = `${directory1Full}/${subDirectory2}`
      const { fdp, account, accountPassword } = await createFdpAndImport()
      consoleMessages.length = 0

      await fdp.personalStorage.create(podName1)
      await fdp.directory.create(podName1, directory1Full)
      await fdp.directory.create(podName1, directory2Full)
      await fdp.directory.create(podName1, subDirectory1Full)
      await fdp.directory.create(podName1, subDirectory2Full)

      for (const directoryToDelete of [subDirectory2Full, subDirectory1Full, directory1Full, directory2Full]) {
        await invokeTestCli([
          'directory',
          'delete',
          directoryToDelete,
          '--pod',
          podName1,
          '--account',
          account,
          '--password',
          accountPassword,
        ])

        expect(consoleMessages[0]).toContain(`Directory "${directoryToDelete}" deleted successfully!`)
        consoleMessages.length = 0
      }

      expect((await fdp.directory.read(podName1, '/')).getDirectories()).toHaveLength(0)
    })

    it('should read directories with portable account', async () => {
      const portableUsername = getRandomString()
      const portablePassword = getRandomString()
      const newAccountPassword = getRandomString()
      const podName1 = getRandomString()
      const directory1 = getRandomString()
      const directory1Full = `/${directory1}`
      const fdp = createFdp()

      const wallet = fdp.account.createWallet()
      await topUpAddress(wallet.address)
      await fdp.account.register(portableUsername, portablePassword)
      await fdp.personalStorage.create(podName1)
      await fdp.directory.create(podName1, directory1Full)

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
      consoleMessages.length = 0

      await invokeTestCli([
        'directory',
        'read',
        '/',
        '--pod',
        podName1,
        '--account',
        portableUsername,
        '--password',
        newAccountPassword,
      ])
      expect(consoleMessages[0]).toContain('Name:')
      expect(consoleMessages[0]).toContain(directory1)
      expect(consoleMessages[1]).toContain('Type')
      expect(consoleMessages[1]).toContain('directory')
    })
  },
  { configFileName: 'directory' },
)
