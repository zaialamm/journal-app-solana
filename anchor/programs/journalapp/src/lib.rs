#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod journalapp {
    use super::*;

  pub fn close(_ctx: Context<CloseJournalapp>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.journalapp.count = ctx.accounts.journalapp.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.journalapp.count = ctx.accounts.journalapp.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeJournalapp>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.journalapp.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeJournalapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Journalapp::INIT_SPACE,
  payer = payer
  )]
  pub journalapp: Account<'info, Journalapp>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseJournalapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub journalapp: Account<'info, Journalapp>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub journalapp: Account<'info, Journalapp>,
}

#[account]
#[derive(InitSpace)]
pub struct Journalapp {
  count: u8,
}
