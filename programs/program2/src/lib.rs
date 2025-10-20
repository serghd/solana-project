use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};
use program1::program::Program1;
use program1::cpi::accounts::TransferTokens as Program1Tokens;

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