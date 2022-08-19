import { describeCommand, invokeTestCli } from '../utility'
import PackageJson from '../../package.json'

describeCommand('Version command', ({ consoleMessages }) => {
  it('should be equal to package version', async () => {
    await invokeTestCli(['--version'])
    expect(consoleMessages[0]).toContain(PackageJson.version)
  })
})
