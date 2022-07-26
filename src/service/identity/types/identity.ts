import { SimpleWallet, V3Keystore } from './wallet'

export type IdentityWallet = V3Keystore | SimpleWallet

export enum IdentityType {
  simple,
  v3,
}

export interface Identity {
  wallet: IdentityWallet
  identityType: IdentityType
}

export const IdentityTypeArray = Object.values(IdentityType).filter(String)
