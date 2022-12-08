import { describeCommand } from '../utility'
import { assertConfigContent } from '../../src/utils/config'

describeCommand('Config data', () => {
  it('should validate config', () => {
    const beeApiUrl = 'http://localhost:1633'
    const beeDebugApiUrl = 'http://localhost:1635'
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    const encryptedSeed = 'aefaefaef'
    const correctConfig = {
      beeApiUrl,
      beeDebugApiUrl,
      accounts: {
        hello: {
          address,
          encryptedSeed,
          mainPod: '',
        },
      },
      mainAccount: '',
    }

    const incorrectConfigs = [
      { data: null, message: 'Config error: data is not an object' },
      { data: '', message: 'Config error: data is not an object' },
      { data: '{"hello": "world"}', message: 'Config error: data is not an object' },
      { data: { hello: 'world' }, message: 'Config error: `beeApiUrl` is not defined or empty' },
      { data: { beeApiUrl: '' }, message: 'Config error: `beeApiUrl` is not defined or empty' },
      { data: { beeApiUrl }, message: 'Config error: `beeDebugApiUrl` is not defined or empty' },
      {
        data: { beeApiUrl, beeDebugApiUrl: '' },
        message: 'Config error: `beeDebugApiUrl` is not defined or empty',
      },
      {
        data: { beeApiUrl, beeDebugApiUrl },
        message: 'Config error: `accounts` is not an object',
      },
      {
        data: { beeApiUrl, beeDebugApiUrl, accounts: 'hello' },
        message: 'Config error: `accounts` is not an object',
      },
      {
        data: { beeApiUrl, beeDebugApiUrl, accounts: { hello: 'world' } },
        message: 'Config error: `mainAccount` is not defined',
      },
      {
        data: { beeApiUrl, beeDebugApiUrl, accounts: { '': 'world' }, mainAccount: '' },
        message: 'Config error: account name is empty',
      },
      {
        data: { beeApiUrl, beeDebugApiUrl, accounts: { hello: 'world' }, mainAccount: '' },
        message: 'Config error: one of the accounts is not correct',
      },
      {
        data: {
          beeApiUrl,
          beeDebugApiUrl,
          accounts: {
            hello: {
              address: '',
              encryptedSeed: '',
            },
          },
          mainAccount: '',
        },
        message: 'Config error: one of the accounts is not correct',
      },
      {
        data: {
          beeApiUrl,
          beeDebugApiUrl,
          accounts: {
            hello: {
              address,
              encryptedSeed: '',
            },
          },
          mainAccount: '',
        },
        message: 'Config error: one of the accounts is not correct',
      },
    ]

    for (const { data, message } of incorrectConfigs) {
      expect(() => assertConfigContent(data)).toThrow(message)
    }

    expect(() => assertConfigContent(correctConfig)).not.toThrow()
  })
})
