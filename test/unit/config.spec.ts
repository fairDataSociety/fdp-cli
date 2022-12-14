import { describeCommand } from '../utility'
import { assertConfigContent, GOERLI_OPTION_NAME } from '../../src/utils/config'

describeCommand('Config data', () => {
  it('should validate config', () => {
    const beeApiUrl = 'http://localhost:1633'
    const beeDebugApiUrl = 'http://localhost:1635'
    const ensNetwork = GOERLI_OPTION_NAME
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    const encryptedSeed = 'aefaefaef'
    const correctConfig = {
      beeApiUrl,
      beeDebugApiUrl,
      ensNetwork,
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
        message: 'Config error: `ensNetwork` is not defined or empty',
      },
      {
        data: { beeApiUrl, beeDebugApiUrl, ensNetwork },
        message: 'Config error: `accounts` is not an object',
      },
      {
        data: { beeApiUrl, beeDebugApiUrl, ensNetwork, accounts: 'hello' },
        message: 'Config error: `accounts` is not an object',
      },
      {
        data: { beeApiUrl, beeDebugApiUrl, ensNetwork, accounts: { hello: 'world' } },
        message: 'Config error: `mainAccount` is not defined',
      },
      {
        data: { beeApiUrl, beeDebugApiUrl, ensNetwork, accounts: { '': 'world' }, mainAccount: '' },
        message: 'Config error: account name is empty',
      },
      {
        data: { beeApiUrl, beeDebugApiUrl, ensNetwork, accounts: { hello: 'world' }, mainAccount: '' },
        message: 'Config error: one of the accounts is not correct',
      },
      {
        data: {
          beeApiUrl,
          beeDebugApiUrl,
          ensNetwork,
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
          ensNetwork,
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
