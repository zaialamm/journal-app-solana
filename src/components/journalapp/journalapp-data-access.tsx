'use client'

import { getJournalappProgram, getJournalappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useJournalappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getJournalappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getJournalappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['journalapp', 'all', { cluster }],
    queryFn: () => program.account.journalapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['journalapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ journalapp: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useJournalappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useJournalappProgram()

  const accountQuery = useQuery({
    queryKey: ['journalapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['journalapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ journalapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['journalapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ journalapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['journalapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ journalapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['journalapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ journalapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
