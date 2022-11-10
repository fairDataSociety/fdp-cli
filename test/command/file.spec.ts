import { describeCommand, invokeTestCli } from '../utility'
import { getRandomString, getTestFilePath } from '../utils'
import { createFdpAndImport } from '../utility/fdp'
import { readFileSync } from 'fs'
import tmp from 'tmp'

describeCommand(
  'Test File command',
  ({ consoleMessages }) => {
    it('should upload a file', async () => {
      const fileSource1 = getTestFilePath('file1.bin')
      const podName1 = getRandomString()
      const fileName1 = `${getRandomString()}.bin`
      const fullFilePath1 = `/${fileName1}`
      const { fdp, account, accountPassword } = await createFdpAndImport()
      consoleMessages.length = 0

      await fdp.personalStorage.create(podName1)
      await invokeTestCli([
        'file',
        'upload',
        fileSource1,
        fullFilePath1,
        '--pod',
        podName1,
        '--account',
        account,
        '--password',
        accountPassword,
      ])

      expect(consoleMessages[0]).toContain('uploaded successfully to')
      expect(consoleMessages[0]).toContain(fullFilePath1)
      consoleMessages.length = 0

      const files1 = (await fdp.directory.read(podName1, '/', true)).getFiles()
      expect(files1).toHaveLength(1)
      expect(files1[0].name).toEqual(fileName1)
    })

    it('should delete a file', async () => {
      const fileSource1 = getTestFilePath('file1.bin')
      const podName1 = getRandomString()
      const fileName1 = `${getRandomString()}.bin`
      const fullFilePath1 = `/${fileName1}`
      const { fdp, account, accountPassword } = await createFdpAndImport()
      consoleMessages.length = 0

      await fdp.personalStorage.create(podName1)
      await fdp.file.uploadData(podName1, fullFilePath1, readFileSync(fileSource1))

      await invokeTestCli([
        'file',
        'delete',
        fullFilePath1,
        '--pod',
        podName1,
        '--account',
        account,
        '--password',
        accountPassword,
      ])

      const files2 = (await fdp.directory.read(podName1, '/', true)).getFiles()
      expect(files2).toHaveLength(0)
    })

    it('should download a file', async () => {
      const fileSource1 = getTestFilePath('file1.bin')
      const podName1 = getRandomString()
      const fileName1 = `${getRandomString()}.bin`
      const fullFilePath1 = `/${fileName1}`
      const tempFile1 = tmp.fileSync()
      const { fdp, account, accountPassword } = await createFdpAndImport()
      consoleMessages.length = 0

      await fdp.personalStorage.create(podName1)
      const fileData1 = readFileSync(fileSource1)
      await fdp.file.uploadData(podName1, fullFilePath1, fileData1)

      await invokeTestCli([
        'file',
        'download',
        fullFilePath1,
        tempFile1.name,
        '--pod',
        podName1,
        '--account',
        account,
        '--password',
        accountPassword,
      ])

      expect(consoleMessages[0]).toContain('downloaded successfully to')
      expect(consoleMessages[0]).toContain(fullFilePath1)
      expect(consoleMessages[0]).toContain(tempFile1.name)

      const downloadedFile = readFileSync(tempFile1.name)
      expect(downloadedFile.length).toEqual(fileData1.length)

      tempFile1.removeCallback()
    })
  },
  { configFileName: 'file' },
)
