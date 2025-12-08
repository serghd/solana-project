#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};
use program1::cpi::accounts::TransferTokens as Program1Tokens;
use program1::program::Program1;

#[allow(unused_imports)]
use security_info::security_txt;

declare_id!("572U58pCWdwqk3NF2qjsmsHmeUmLtNokt3ZgJLbaNeib");

#[program]
pub mod program2 {
   use super::*;

   pub fn call_transfer(ctx: Context<CallTransfer>, amount: u64) -> Result<()> {
      let cpi_accounts = Program1Tokens {
         signer: ctx.accounts.signer.to_account_info(),
         from: ctx.accounts.from.to_account_info(),
         to: ctx.accounts.to.to_account_info(),
         token_program: ctx.accounts.token_program.to_account_info(),
      };

      let cpi_program = ctx.accounts.program1_program.to_account_info();
      let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

      program1::cpi::transfer_tokens(cpi_ctx, amount)?;
      Ok(())
   }

   pub fn create_account(ctx: Context<CreateAccount>) -> Result<()> {
      let account = &mut ctx.accounts.account_pda;
      account.bump = ctx.bumps.account_pda;
      account.authority = ctx.accounts.signer.key();

      Ok(())
   }

   pub fn burn_account(ctx: Context<BurnAccount>) -> Result<()> {
      let account = &ctx.accounts.account_pda;

      require_keys_eq!(account.authority, ctx.accounts.signer.key(), ErrorCode::Unauthorized);

      Ok(())
   }
}

#[derive(Accounts)]
pub struct CallTransfer<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(mut)]
   pub from: Account<'info, TokenAccount>,
   #[account(mut)]
   pub to: Account<'info, TokenAccount>,

   pub program1_program: Program<'info, Program1>,
   pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateAccount<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(
        init_if_needed,
        payer = signer,
        space = 8 + DataAccount::INIT_SPACE,
        seeds = [b"account-pda"],
        bump
    )]
   pub account_pda: Account<'info, DataAccount>,

   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BurnAccount<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(
        mut,
        close = signer
    )]
   pub account_pda: Account<'info, DataAccount>,
   pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct DataAccount {
   pub authority: Pubkey,
   pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
   #[msg("You are not authorized to perform this action.")]
   Unauthorized,
}
