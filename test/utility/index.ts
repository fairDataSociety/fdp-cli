import { join } from 'path'
import { existsSync, unlinkSync } from 'fs'
import { cli } from 'furious-commander'
import { optionParameters, rootCommandClasses } from '../../src/config'
import { errorHandler } from '../../src/utils/error'

type describeFunctionArgs = {
  consoleMessages: string[]
  configFolderPath: string
  configFilePath: string
  getNthLastMessage: (n: number) => string
  getLastMessage: () => string
  hasMessageContaining: (substring: string) => boolean
}

export async function invokeTestCli(argv: string[]): ReturnType<typeof cli> {
  return await cli({
    rootCommandClasses,
    optionParameters,
    testArguments: argv,
    errorHandler,
  })
}

export function describeCommand(
  description: string,
  func: (clauseFields: describeFunctionArgs) => void,
  options?: { configFileName?: string },
): void {
  describe(description, () => {
    const consoleMessages: string[] = []
    const configFileName = options?.configFileName
    const getNthLastMessage = (n: number) => consoleMessages[consoleMessages.length - n]
    const getLastMessage = () => consoleMessages[consoleMessages.length - 1]
    const hasMessageContaining = (substring: string) =>
      Boolean(consoleMessages.find(consoleMessage => consoleMessage.includes(substring)))
    const configFolderPath = join(__dirname, '..', 'testconfig')

    //set config environment variable
    process.env.FDP_CLI_CONFIG_FOLDER = configFolderPath

    global.console.log = jest.fn(message => {
      consoleMessages.push(message)
    })
    global.console.error = jest.fn(message => {
      consoleMessages.push(message)
    })

    global.process.stdout.write = jest.fn(message => {
      if (typeof message === 'string') {
        consoleMessages.push(message)
      } else {
        consoleMessages.push(new TextDecoder().decode(message))
      }

      return true
    })

    jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit() was called.')
    })

    jest.spyOn(global.console, 'warn')

    let configFilePath = ''

    //if own config is needed
    if (configFileName) {
      const fileName = `${configFileName}.json`
      configFilePath = join(configFolderPath, fileName)

      //set config environment variable
      process.env.FDP_CLI_CONFIG_FILE = fileName
      process.env.FDP_CLI_CONFIG_FILE_PATH = configFilePath

      //remove config file if it exists
      if (existsSync(configFilePath)) unlinkSync(configFilePath)
    }

    beforeEach(() => {
      consoleMessages.length = 0
    })

    func({ consoleMessages, getNthLastMessage, getLastMessage, hasMessageContaining, configFolderPath, configFilePath })
  })
}
