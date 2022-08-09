function identityNameConflict(name: string): string {
  return `An identity with the name '${name}' already exists`
}

function identityNameConflictArgument(name: string): string {
  return `${identityNameConflict(name)}. Provide a unique name in the first argument`
}

function identityNameConflictOption(name: string): string {
  return `${identityNameConflict(name)}. Provide a unique name with the --name option`
}

function noIdentity(): string {
  return "No identities found. Create one with the command 'identity create'"
}

function noSuchIdentity(name: string): string {
  return `No identity found with the name '${name}'`
}

function optionNotDefined(name: string, option?: string): string {
  return `No ${name} specified with the '--${option || name}' option`
}

function existingV3Password(): string {
  return 'Enter the current password of the V3 wallet'
}

function newMnemonicPassword(): string {
  return 'Enter a new password for the mnemonic'
}

function newMnemonicPasswordConfirmation(): string {
  return 'Enter the new password again for the mnemonic'
}

function requireOptionConfirmation(option: string, message: string): string {
  return `${message}. Pass the --${option} option to allow it`
}

function invalidV3Wallet(): string {
  return 'Received data is not a valid V3 wallet'
}

export const Message = {
  identityNameConflict,
  identityNameConflictArgument,
  identityNameConflictOption,
  noIdentity,
  noSuchIdentity,
  optionNotDefined,
  existingV3Password,
  newMnemonicPassword,
  newMnemonicPasswordConfirmation,
  requireOptionConfirmation,
  invalidV3Wallet,
}
