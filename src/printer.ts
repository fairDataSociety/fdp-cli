import chalk from 'chalk'
import { Printer } from 'furious-commander/dist/printer'
import { Printer as FdpPrinter } from './command/root-command/printer'

export const printer: Printer = {
  print: FdpPrinter.log,
  printError: FdpPrinter.error,
  printHeading: (text: string) => FdpPrinter.log(chalk.bold('█ ' + text)),
  formatDim: (text: string) => chalk.dim(text),
  formatImportant: (text: string) => chalk.bold(text),
  getGenericErrorMessage: () => 'Failed to run command!',
}
