// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import JournalappIDL from '../target/idl/journalapp.json'
import type { Journalapp } from '../target/types/journalapp'

// Re-export the generated IDL and type
export { Journalapp, JournalappIDL }

// The programId is imported from the program IDL.
export const JOURNALAPP_PROGRAM_ID = new PublicKey(JournalappIDL.address)

// This is a helper function to get the Journalapp Anchor program.
export function getJournalappProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...JournalappIDL, address: address ? address.toBase58() : JournalappIDL.address } as Journalapp, provider)
}

// This is a helper function to get the program ID for the Journalapp program depending on the cluster.
export function getJournalappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Journalapp program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return JOURNALAPP_PROGRAM_ID
  }
}
