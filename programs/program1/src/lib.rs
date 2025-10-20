use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::spl_token::instruction::AuthorityType;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("KBCe2H8VpgPh44QPURqj5uiywx93CG3j1rGtBY3TXLY");

#[program]
pub mod program1 {
   use super::*;

   pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
      let data_account = &mut ctx.accounts.data_account;
      data_account.owner = ctx.accounts.owner.key();
      data_account.counter = 0u64;

      msg!("Data account created: {}", data_account.key().to_string());
      Ok(())
   }

   pub fn add_value(ctx: Context<AddValue>, value: u64) -> Result<()> {
      let data = &mut ctx.accounts.data_account;
      let item = &mut ctx.accounts.item_account;
      require!(ctx.accounts.owner.key() == data.owner, ErrorCode::Unauthorized);
      
      item.owner = ctx.accounts.owner.key();
      item.index = data.counter;
      item.value = value;

      data.counter += 1;

      msg!("Value has been added. Item owner {}, value {}", item.owner.key().to_string(), value.to_string());
      Ok(())
   }

   pub fn get_value(ctx: Context<GetValue>) -> Result<()> {
      let item = &ctx.accounts.item_account;
      msg!("Stored index is {}. Value is: {}", item.index, item.value);
      Ok(())
   }

   pub fn update_value(ctx: Context<UpdateValue>, value: u64) -> Result<()> {
      let item = &mut ctx.accounts.item_account;
      require!(ctx.accounts.owner.key() == item.owner, ErrorCode::Unauthorized);

      item.value = value;

      msg!("Value has been update. Item owner {}, new value {}", item.owner.key().to_string(), item.value.to_string());
      Ok(())
   }

   pub fn reset_value(ctx: Context<ResetValue>) -> Result<()> {
      let item = &mut ctx.accounts.item_account;
      require!(ctx.accounts.owner.key() == item.owner, ErrorCode::Unauthorized);

      item.value = 0u64;

      msg!("Value has been reset. Item owner {}, new value {}", item.owner.key().to_string(), item.value.to_string());
      Ok(())
   }

   pub fn mint_tokens(ctx: Context<MintToken>, total_supply: u64) -> Result<()> {
      require_keys_eq!(ctx.accounts.signer.key(), DEPLOYER_WALLET, ErrorCode::Unauthorized);

      let mint = &ctx.accounts.mint;
      let token_program = &ctx.accounts.token_program;

      // mint all tokens to Token Owner
      let cpi_token = CpiContext::new(
         token_program.to_account_info(),
         token::MintTo {
            mint: mint.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
         },
      );
      token::mint_to(cpi_token, total_supply)?;

      Ok(())
   }

   pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
      require_keys_eq!(ctx.accounts.signer.key(), DEPLOYER_WALLET, ErrorCode::Unauthorized);
      
      let cpi_accounts = Transfer {
         from: ctx.accounts.from.to_account_info(),
         to: ctx.accounts.to.to_account_info(),
         authority: ctx.accounts.signer.to_account_info(),
      };
      let cpi_program = ctx.accounts.token_program.to_account_info();
      let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

      token::transfer(cpi_ctx, amount)?;
      Ok(())
   }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
   #[account(
      init,
      payer = owner,
      // discriminator + Pubkey + counter
      space = 8 + std::mem::size_of::<Pubkey>() + std::mem::size_of::<u64>())
   ]
   pub data_account: Account<'info, DataAccount>,

   #[account(mut)]
   pub owner: Signer<'info>,

   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddValue<'info> {
   #[account(mut)]
   pub data_account: Account<'info, DataAccount>,  

   #[account(
        init,
        payer = owner,
        space = 8 + std::mem::size_of::<Pubkey>() + (2 * std::mem::size_of::<u64>()), // discriminator + Pubkey + index + value
    )]
   pub item_account: Account<'info, ItemAccount>,
  
   #[account(mut)]
   pub owner: Signer<'info>,
   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetValue<'info> {
   pub item_account: Account<'info, ItemAccount>,
}

#[derive(Accounts)]
pub struct UpdateValue<'info> {
   #[account(mut)]
   pub item_account: Account<'info, ItemAccount>,
   
   #[account(mut)]
   pub owner: Signer<'info>,
   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResetValue<'info> {
   #[account(mut)]
   pub item_account: Account<'info, ItemAccount>,
   
   #[account(mut)]
   pub owner: Signer<'info>,
   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintToken<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(mut)]
   pub mint: Account<'info, Mint>,

   #[account(mut)]
   pub to: Account<'info, TokenAccount>,

   pub token_program: Program<'info, Token>,
   pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
   #[account(mut)]
   pub signer: Signer<'info>,

   #[account(mut)]
   pub from: Account<'info, TokenAccount>,

   #[account(mut)]
   pub to: Account<'info, TokenAccount>,

   pub token_program: Program<'info, Token>,
}

#[account]
pub struct DataAccount {
   pub counter: u64,
   pub owner: Pubkey,
}

#[account]
pub struct ItemAccount {
   pub index: u64,
   pub value: u64,
   pub owner: Pubkey,
}

#[account]
pub struct PdaData {
   pub authority: Pubkey,
   pub bump: u8,
}

pub static DEPLOYER_WALLET: Pubkey = Pubkey::new_from_array([
   216, 92, 65, 244, 142, 169, 55, 135, 113, 86, 119, 243, 161, 196, 241, 32, 169, 63, 99, 222,
   194, 16, 45, 27, 67, 8, 202, 50, 68, 42, 73, 204,
]);

#[error_code]
pub enum ErrorCode {
   #[msg("Undefined Error")]
   UndefinedError,
   #[msg("The vector index is out of bounds.")]
   OutOfBounds,
   #[msg("You are not authorized to perform this action.")]
   Unauthorized,
}