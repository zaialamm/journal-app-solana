#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("2mQigrqhChp8F9HMJ7a5AvGGjGw8kng3UT56TQ7hTtyu");

#[program]
pub mod journalapp {
    use super::*;

    // instruction handler to create a new journal entry
    pub fn create_journal_entry(
      ctx: Context<CreateJournalEntry>, 
      title: String, 
      message: String,
    ) -> Result<()> {
        msg!("Journal Entry created");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())
    }

    // instruction handler to update journal entry
    pub fn update_journal_entry(
      ctx: Context<UpdateJournalEntry>, 
      title: String, 
      message: String,
    ) -> Result<()> {
        msg!("Journal Entry updated");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())
    }


    // instruction handler to delete journal entry
    pub fn delete_journal_entry(
      ctx: Context<DeleteJournalEntry>,
      title: String,
    ) -> Result<()> {
        msg!("Journal entry titled {} deleted", title);
        Ok(())
    }
}

//define the journal program state
#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
}

// define data structure for the create_journal_entry handler
#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct CreateJournalEntry<'info> {
    #[account(
      init, 
      seeds = [title.as_bytes(), owner.key().as_ref()],
      bump,
      payer = owner, 
      space = 8 + JournalEntryState::INIT_SPACE
    )]

    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}

// define data structure for update_journal_entry handler
#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct UpdateJournalEntry<'info> {
    #[account(
      mut,
      seeds = [title.as_bytes(), owner.key().as_ref()],
      bump,
      realloc = 8 + JournalEntryState::INIT_SPACE,
      realloc::payer = owner,
      realloc::zero = true,    
    )]

    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>

}


// define data structure for delete_journal_entry handler
#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteJournalEntry<'info> {
    #[account(
      mut,
      seeds = [title.as_bytes(), owner.key().as_ref()],
      bump,
      close = owner,
    )]

    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}