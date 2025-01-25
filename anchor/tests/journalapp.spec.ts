import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Journalapp} from '../target/types/journalapp'

describe('journalapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Journalapp as Program<Journalapp>

  const journalappKeypair = Keypair.generate()

  it('Initialize Journalapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        journalapp: journalappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([journalappKeypair])
      .rpc()

    const currentCount = await program.account.journalapp.fetch(journalappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Journalapp', async () => {
    await program.methods.increment().accounts({ journalapp: journalappKeypair.publicKey }).rpc()

    const currentCount = await program.account.journalapp.fetch(journalappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Journalapp Again', async () => {
    await program.methods.increment().accounts({ journalapp: journalappKeypair.publicKey }).rpc()

    const currentCount = await program.account.journalapp.fetch(journalappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Journalapp', async () => {
    await program.methods.decrement().accounts({ journalapp: journalappKeypair.publicKey }).rpc()

    const currentCount = await program.account.journalapp.fetch(journalappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set journalapp value', async () => {
    await program.methods.set(42).accounts({ journalapp: journalappKeypair.publicKey }).rpc()

    const currentCount = await program.account.journalapp.fetch(journalappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the journalapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        journalapp: journalappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.journalapp.fetchNullable(journalappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
