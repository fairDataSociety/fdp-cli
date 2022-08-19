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

function optionNotDefined(name: string, option?: string): string {
  return `No ${name} specified with the '--${option || name}' option`
}

function optionNotDefinedWithTitle(title: string, name: string, option?: string): string {
  return `No ${title} specified with the '--${option || name}' option`
}

function newAccountPassword(): string {
  return 'Enter a new password for the account'
}

function newAccountPasswordConfirmation(): string {
  return 'Enter the new password again for the account'
}

function portableAccountPassword(): string {
  return 'Enter a password for the portable FDP account'
}

function portableAccountPasswordConfirmation(): string {
  return 'Enter a password again for the portable FDP account'
}

function requireOptionConfirmation(option: string, message: string): string {
  return `${message}. Pass the --${option} option to allow it`
}

function invalidMnemonic(): string {
  return 'Received data is not a valid mnemonic'
}

function newAccountRegistered(): string {
  return 'New account registered successfully!'
}

function passwordLengthError(minPasswordLength: number, maxPasswordLength: number): string {
  return `Password length must be between ${minPasswordLength} and ${maxPasswordLength} characters`
}

function topUpBalance(): string {
  return 'In order to register with the account in ENS you need to top up the balance before registration'
}

function unsupportedAccountType(): string {
  return 'Unsupported account type'
}

function noUsableBatch(): string {
  return 'Usable batch not found'
}

function loggedInSuccessfully(): string {
  return 'Logged in successfully!'
}

export const Message = {
  accountNameConflict,
  accountNameConflictArgument,
  accountNameConflictOption,
  noAccount,
  noSuchAccount,
  optionNotDefined,
  optionNotDefinedWithTitle,
  requireOptionConfirmation,
  newAccountPassword,
  newAccountPasswordConfirmation,
  portableAccountPassword,
  portableAccountPasswordConfirmation,
  invalidMnemonic,
  newAccountRegistered,
  passwordLengthError,
  topUpBalance,
  unsupportedAccountType,
  noUsableBatch,
  loggedInSuccessfully,
}
