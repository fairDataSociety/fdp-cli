function accountNameConflict(name: string): string {
  return `An account with the name '${name}' already exists`
}

function accountNameConflictArgument(name: string): string {
  return `${accountNameConflict(name)}. Provide a unique name in the first argument`
}

function accountNameConflictOption(name: string): string {
  return `${accountNameConflict(name)}. Provide a unique name with the --name option`
}

function noAccount(): string {
  return "No accounts found. Create one with the command 'account create'"
}

function noSuchAccount(name: string): string {
  return `No account found with the name '${name}'`
}

function newAccountPassword(): string {
  return 'Enter a new password for the account'
}

function newAccountPasswordConfirmation(): string {
  return 'Enter the new password again for the account'
}

function portableAccountPassword(): string {
  return 'Enter a password for the portable FDS account'
}

function portableAccountPasswordConfirmation(): string {
  return 'Enter a password again for the portable FDS account'
}

function invalidAccount(): string {
  return 'Received data is not a valid account'
}

function newAccountRegistered(): string {
  return 'New account registered successfully!'
}

function unsupportedAccountType(): string {
  return 'Unsupported account type'
}

function emptyAccountsList(): string {
  return 'Account list is empty'
}

function optionNotDefined(name: string, option?: string): string {
  return `No ${name} specified with the '--${option || name}' option`
}

function optionNotDefinedWithTitle(title: string, name: string, option?: string): string {
  return `No ${title} specified with the '--${option || name}' option`
}

function requireOptionConfirmation(option: string, message: string): string {
  return `${message}. Pass the --${option} option to allow it`
}

function optionValueIsNotAllowed(optionName: string, optionValue: string): string {
  return `Value '${optionValue}' is not allowed in --${optionName} option`
}

function passwordLengthError(minPasswordLength: number, maxPasswordLength: number): string {
  return `Password length must be between ${minPasswordLength} and ${maxPasswordLength} characters`
}

function topUpBalance(): string {
  return 'In order to register with the account in ENS you need to top up the balance before registration'
}

function noUsableBatch(): string {
  return 'Usable batch not found'
}

function loggedInSuccessfully(): string {
  return 'Logged in successfully!'
}

function podCreatedSuccessfully(): string {
  return 'Pod created successfully!'
}

function podDeletedSuccessfully(): string {
  return 'Pod deleted successfully!'
}

function emptyPodsList(): string {
  return 'Pods list is empty'
}

function directoryCreatedSuccessfully(): string {
  return 'Directory created successfully!'
}

function directoryDeletedSuccessfully(name?: string): string {
  return `Directory ${name ? `"${name}"` : ''} deleted successfully!`
}

function emptyDirectory(): string {
  return 'Directory is empty'
}

function fileDeletedSuccessfully(name?: string): string {
  return `File ${name ? `"${name}"` : ''} deleted successfully!`
}

function fileUploadedSuccessfully(source: string, destination: string): string {
  return `File "${source}" uploaded successfully to "${destination}"!`
}

function fileUploadError(message: string): string {
  return `File can't be uploaded: ${message}`
}

function fileDeleteError(message: string): string {
  return `File can't be deleted: ${message}`
}

function fileDownloadedSuccessfully(source: string, destination: string): string {
  return `File "${source}" downloaded successfully to "${destination}"`
}

function fileDownloadError(message: string): string {
  return `File can't be downloaded: ${message}`
}

function newMainAccount(message: string): string {
  return `New main account: ${message}`
}

function mainAccount(message: string): string {
  return `Current main account: ${message}`
}

function mainAccountEmpty(): string {
  return `Main account is not defined`
}

function newMainPod(message: string): string {
  return `New main pod: ${message}`
}

function mainPod(message: string): string {
  return `Current main pod: ${message}`
}

function mainPodEmpty(): string {
  return `Main pod is not defined`
}

function podNotFound(message: string): string {
  return `Pod not found: ${message}`
}

function beeIsNotAvailable(url: string): string {
  return `Bee node is not available by url: ${url}`
}

export const Message = {
  accountNameConflict,
  accountNameConflictArgument,
  accountNameConflictOption,
  noAccount,
  noSuchAccount,
  newAccountPassword,
  newAccountPasswordConfirmation,
  portableAccountPassword,
  portableAccountPasswordConfirmation,
  invalidAccount,
  newAccountRegistered,
  unsupportedAccountType,
  emptyAccountsList,
  optionNotDefined,
  optionNotDefinedWithTitle,
  requireOptionConfirmation,
  optionValueIsNotAllowed,
  passwordLengthError,
  topUpBalance,
  noUsableBatch,
  loggedInSuccessfully,
  podCreatedSuccessfully,
  podDeletedSuccessfully,
  emptyPodsList,
  directoryCreatedSuccessfully,
  directoryDeletedSuccessfully,
  emptyDirectory,
  fileDeletedSuccessfully,
  fileUploadedSuccessfully,
  fileUploadError,
  fileDeleteError,
  fileDownloadedSuccessfully,
  fileDownloadError,
  newMainAccount,
  mainAccount,
  mainAccountEmpty,
  newMainPod,
  mainPod,
  mainPodEmpty,
  podNotFound,
  beeIsNotAvailable,
}
