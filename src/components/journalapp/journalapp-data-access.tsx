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
import { create } from 'domain'

interface CreateEntryArgs {
  title: string;
  message: string;
  owner: PublicKey;
}

// function for initializing account
export function useJournalappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getJournalappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getJournalappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['journalapp', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["journalEntry", "create", { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      return program.methods
        .createJournalEntry(title, message)
        .rpc();
    },

    onSuccess: signature => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: error => {
      toast.error(`Failed to create journal entry: ${error.message}`);
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  }
}

// function for updating the existing account
export function useJournalappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useJournalappProgram()

  const accountQuery = useQuery({
    queryKey: ['journalapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  })

  const updateEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["journalEntry", "update", { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      return program.methods
        .updateJournalEntry(title, message)
        .rpc();
    },

    onSuccess: signature => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: error => {
      toast.error(`Failed to update journal entry: ${error.message}`);
    },

  });

  const deleteEntry = useMutation ({
    mutationKey: ["journalEntry", "delete", { cluster, account }],
    mutationFn: (title: string) => 
      program.methods.deleteJournalEntry(title).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  };
}
