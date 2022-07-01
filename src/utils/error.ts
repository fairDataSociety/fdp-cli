import { printer } from '../printer'
import { FORMATTED_ERROR } from '../command/root-command/printer'
import { getFieldOrNull } from './index'

export function errorHandler(error: unknown): void {
  if (!process.exitCode) {
    process.exitCode = 1
  }
  // grab error.message, or error if it is a string
  const message: string | null = typeof error === 'string' ? error : getFieldOrNull(error, 'message')
  const type: string | null = getFieldOrNull(error, 'type')

  if (message) {
    printer.printError(FORMATTED_ERROR + ' ' + message)
  } else {
    printer.printError(FORMATTED_ERROR + ' The command failed, but there is no error message available.')
  }

  // print 'check bee logs' message if error does not originate from the cli
  if (type !== 'CommandLineError') {
    if (message) {
      printer.printError('')
      printer.printError('There may be additional information in the Bee logs.')
    } else {
      printer.printError('')
      printer.printError('Check your Bee log to learn if your request reached the node.')
    }
  }
}
